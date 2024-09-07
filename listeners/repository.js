const { Client } = require("pg");
const { Client: WClient } = require("whatsapp-web.js");
const { DirectoriesRepository } = require("../repository/directories");
const { LinksRepository } = require("../repository/links");
const { UsersRepository } = require("../repository/users");
const { DirectoriesUsecase } = require("../usecase/directories");
const { LinksUsecase } = require("../usecase/links");
const { UsersUsecase } = require("../usecase/users");
const { Transactor } = require("../utils/transactor");
const { Internal } = require("../exceptions");
const { isURL } = require("../utils/validator");

class RepositoryListener {
  /**
   *@type { UsersUsecase }
   */
  #userUsecase;

  /**
   * @type { DirectoriesUsecase }
   */
  #directoriesUsecase;

  /**
   * @type { LinksUsecase }
   */
  #linksUsecase;

  /**
   *
   * @param {Client} client
   */
  constructor(client) {
    const usersRepository = new UsersRepository(client);
    const directoriesRepository = new DirectoriesRepository(client);
    const linksRepository = new LinksRepository(client);
    const transactor = new Transactor(client);

    this.#userUsecase = new UsersUsecase(usersRepository);
    this.#directoriesUsecase = new DirectoriesUsecase({
      directoriesRepository,
      usersRepository,
      linksRepository,
      transactor,
    });
    this.#linksUsecase = new LinksUsecase({
      linksRepository,
      usersRepository,
      directoriesRepository,
    });
  }

  /**
   *
   * @param {WClient} client
   * @param {import("whatsapp-web.js").Message} message
   */
  async listen(client, message) {
    try {
      const msg = message.body.split(" ").map((str) => str.trim());

      if (msg.length === 1) {
        client.sendMessage(message.from, "invalid command!");
      }

      const contact = await message.getContact();
      const user = { phone_number: contact.number };

      switch (msg[1]) {
        case "register":
          await this.#userUsecase.register(contact.number);
          client.sendMessage(message.from, "successfully registered!");
          break;
        case "dir":
          if (msg.length === 2) {
            const directories = await this.#directoriesUsecase.getDirectories(
              user
            );

            if (directories.length === 0) {
              client.sendMessage(message.from, "you have no directories.");
              break;
            }

            let responseMsg = "Directories:";
            for (let i = 0; i < directories.length; i++) {
              responseMsg += `\n${i + 1}. ${directories[i].title}`;
            }

            client.sendMessage(message.from, responseMsg);
          } else {
            const dir = { title: msg[3] };

            switch (msg[2]) {
              case "show":
                const links = await this.#linksUsecase.getAll(user, dir);
                let responseMsg = "Links:";

                for (let i = 0; i < links.length; i++) {
                  responseMsg += `\n#${links[i].id} ${links[i].url} (${links[i].title})`;
                }

                client.sendMessage(message.from, responseMsg);
                break;
              case "add":
                if (msg.length != 4) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  await this.#directoriesUsecase.add(user, dir);
                  client.sendMessage(message.from, "directory created");
                }
                break;
              case "delete":
                if (msg.length != 4) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  await this.#directoriesUsecase.delete(user, dir);
                  client.sendMessage(message.from, "directory deleted");
                }
                break;
              case "update":
                if (msg.length != 5) {
                  client.sendMessage(message.from, "invalid command!");
                } else {
                  const dir = { title: msg[3] };
                  await this.#directoriesUsecase.update(user, dir, msg[4]);
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
            client.sendMessage(message.from, "invalid command!");
            break;
          }
          let link, titleStr;
          switch (msg[2]) {
            case "add":
              if (msg.length < 6) {
                client.sendMessage(message.from, "invalid command!");
                break;
              }

              if (!isURL(msg[4])) {
                client.sendMessage(message.from, "invalid url!");
                break;
              }

              titleStr = msg.slice(5).join(" ");
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

              await this.#linksUsecase.save(user, dir, link);
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
              await this.#linksUsecase.delete(user, link);
              client.sendMessage(message.from, "link deleted");
              break;
            case "update":
              if (msg.length < 6) {
                client.sendMessage(message.from, "invalid command!");
                break;
              }

              if (!msg[3].startsWith("#")) {
                client.sendMessage(message.from, "invalid link id!");
                break;
              }

              if (msg[5] !== "-") {
                titleStr = msg.slice(5).join(" ");
                if (!titleStr.startsWith(`"`) || !titleStr.endsWith(`"`)) {
                  client.sendMessage(message.from, "invalid command!");
                  break;
                }
                titleStr = titleStr.slice(1, titleStr.length - 1);
              } else {
                titleStr = msg[5];
              }

              link = {
                id: msg[3].slice(1),
                url: msg[4],
                title: titleStr,
              };

              await this.#linksUsecase.update(user, link);
              client.sendMessage(message.from, "link updated!");
              break;
            default:
              client.sendMessage(message.from, "invalid command!");
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
}

module.exports = { RepositoryListener };
