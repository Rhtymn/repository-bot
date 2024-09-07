const { Client } = require("pg");

class Postgres {
  /**
   * postgres client
   * @type { { user: string, password: string, host: string, port: number, database: string } }
   */
  #config;

  /**
   * postgres client
   * @type { Client }
   */
  #client;

  /**
   *
   * @param {{ user: string, password: string, host: string, port: number, database: string }} config
   */
  constructor(config) {
    this.#config = config;
  }

  async connect() {
    try {
      this.#client = new Client(this.#config);
      await this.#client.connect();
    } catch (e) {
      throw new Error("error connecting postgres");
    }
  }

  /**
   *
   * @returns { Client }
   */
  client() {
    return this.#client;
  }
}

module.exports = { Postgres };
