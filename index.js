const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Postgres } = require("./db/postgres");
const { UsersRepository } = require("./repository/users");
const { UsersUsecase } = require("./usecase/users");
const { DirectoriesRepository } = require("./repository/directories");
const { DirectoriesUsecase } = require("./usecase/directories");
const { Internal } = require("./exceptions");
const { LinksRepository } = require("./repository/links");
const { LinksUsecase } = require("./usecase/links");

const client = new Client({
  authStrategy: new LocalAuth(),
});

const postgres = new Postgres({
  user: "postgres",
  password: "password",
  host: "localhost",
  port: 9001,
  database: "db_repositoryapp",
});
postgres.connect();

const usersRepository = new UsersRepository(postgres.client());
const directoriesRepository = new DirectoriesRepository(postgres.client());
const linksRepository = new LinksRepository(postgres.client());

const userUsecase = new UsersUsecase(usersRepository);
const directoriesUsecase = new DirectoriesUsecase({
  directoriesRepository,
  usersRepository,
});
const linksUsecase = new LinksUsecase({
  linksRepository,
  usersRepository,
  directoriesRepository,
});

client.on("ready", () => {
  try {
    console.log("Client is ready!");
  } catch (e) {}
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message) => {
  if (message.body.startsWith("!repo")) {
    try {
      const msg = message.body.split(" ").map((str) => str.trim());

      if (msg.length === 1) {
        client.sendMessage(message.from, "invalid command!");
      }

      const contact = await message.getContact();
      const user = { phone_number: contact.number };

      switch (msg[1]) {
        case "register":
          await userUsecase.register(contact.number);
          client.sendMessage(message.from, "successfully registered!");
          break;
        case "dir":
          if (msg.length === 2) {
            const directories = await directoriesUsecase.getDirectories(user);
            let responseMsg = "Directories:";

            for (let i = 0; i < directories.length; i++) {
              responseMsg += `\n${i + 1}. ${directories[i].title}`;
            }

            client.sendMessage(message.from, responseMsg);
          } else {
            const dir = { title: msg[3] };

            switch (msg[2]) {
              case "add":
                if (msg.length != 4) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  await directoriesUsecase.add(user, dir);
                  client.sendMessage(message.from, "directory created");
                }
                break;
              case "delete":
                if (msg.length != 4) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  await directoriesUsecase.delete(user, dir);
                  client.sendMessage(message.from, "directory deleted");
                }
                break;
              case "update":
                if (msg.length != 5) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  const dir = { title: msg[3] };
                  await directoriesUsecase.update(user, dir, msg[4]);
                  client.sendMessage(message.from, "directory updated");
                }
                break;
              default:
                client.sendMessage(message.from, "invalid command!");
            }
          }
          break;
        case "link":
          if (msg.length === 2) {
          } else {
            let link;
            switch (msg[2]) {
              case "add":
                console.log(msg);
                if (msg.length < 6) {
                  client.sendMessage(message.from, "invalid command!");
                  break;
                }

                let titleStr = msg.slice(5).join(" ");
                if (!titleStr.startsWith(`"`) || !titleStr.endsWith(`"`)) {
                  client.sendMessage(message.from, "invalid command!");
                  break;
                }

                titleStr = titleStr.slice(1, titleStr.length - 1);
                const dir = { title: msg[3] };
                link = {
                  url: msg[4],
                  title: titleStr,
                };

                await linksUsecase.save(user, dir, link);
                client.sendMessage(message.from, "link saved");

                break;
              case "delete":
                if (msg.length !== 4) {
                  client.sendMessage(message.from, "invalid command!");
                  break;
                }

                if (!msg[3].startsWith("#")) {
                  client.sendMessage(message.from, "invalid link id!");
                  break;
                }

                link = { id: msg[3].slice(1) };
                await linksUsecase.delete(user, link);
                client.sendMessage(message.from, "link deleted");
                break;
              default:
                client.sendMessage(message.from, "invalid command!");
            }
          }
          break;
        default:
          client.sendMessage(message.from, "invalid command!");
      }
    } catch (e) {
      if (e instanceof Internal) {
        client.sendMessage(message.from, "internal server error");
      } else {
        client.sendMessage(message.from, e.message);
      }
    }
  }
});

client.initialize();
