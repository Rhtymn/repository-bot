const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Postgres } = require("./db/postgres");
const { UsersRepository } = require("./repository/users");
const { UsersUsecase } = require("./usecase/users");

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

const userRepository = new UsersRepository(postgres.client());
const userUsecase = new UsersUsecase(userRepository);

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
        default:
          client.sendMessage(message.from, "invalid command!");
      }
    } catch (e) {
      client.sendMessage(message.from, e.message);
    }
  }
});

client.initialize();
