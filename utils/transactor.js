const { Client } = require("pg");

class Transactor {
  /**
   * postgres client
   * @type { Client }
   */
  #client;

  /**
   *
   * @param {Client} client
   */
  constructor(client) {
    this.#client = client;
  }

  /**
   *
   * @param {() => Promise<void>} cb
   */
  async withinTransaction(cb) {
    try {
      this.#client.query("BEGIN");
      await cb();
      this.#client.query("COMMIT");
    } catch (e) {
      this.#client.query("ROLLBACK");
      throw e;
    }
  }
}

module.exports = { Transactor };
