const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Postgres } = require("./db/postgres");
const { UsersRepository } = require("./repository/users");
const { UsersUsecase } = require("./usecase/users");
const { DirectoriesRepository } = require("./repository/directories");
const { DirectoriesUsecase } = require("./usecase/directories");
const { Internal } = require("./exceptions");

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

const userUsecase = new UsersUsecase(usersRepository);
const directoriesUsecase = new DirectoriesUsecase({
  directoriesRepository,
  usersRepository,
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
      const msg = message.body.split(" ");

      if (msg.length === 1) {
        client.sendMessage(message.from, "invalid command!");
      }

      const contact = await message.getContact();

      switch (msg[1]) {
        case "register":
          await userUsecase.register(contact.number);
          client.sendMessage(message.from, "successfully registered!");
          break;
        case "dir":
          if (msg.length === 2) {
          } else {
            switch (msg[2]) {
              case "add":
                if (msg.length === 3) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  await directoriesUsecase.add(contact.number, msg[3]);
                  client.sendMessage(message.from, "directory created");
                }
                break;
              case "delete":
                if (msg.length === 3) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  await directoriesUsecase.delete(contact.number, msg[3]);
                  client.sendMessage(message.from, "directory deleted");
                }
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
