const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { Postgres } = require("./db/postgres");
const { RepositoryListener } = require("./listeners/repository");
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

const repositoryListener = new RepositoryListener(postgres.client());

client.on("ready", () => {
  try {
    console.log("Client is ready!");
  } catch (e) {}
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message) => {
  try {
    if (message.body.startsWith("!repo")) {
      repositoryListener.listen(client, message);
    }
  } catch (e) {
    if (e instanceof Internal) {
      client.sendMessage(
        message.from,
        "something went wrong. try again later."
      );
    } else {
      client.sendMessage(message.from, e.message);
    }
  }
});

client.initialize();
