const { Client } = require("pg");
const { Internal } = require("../exceptions");

class DirectoriesRepository {
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
   * @param {number} idUser
   * @param {string} title
   */
  async save(idUser, title) {
    try {
      const q = `INSERT INTO directories(id_user, title) VALUES($1, $2)`;
      const params = [idUser, title];
      await this.#client.query(q, params);
    } catch (e) {
      throw new Internal("error creating directory");
    }
  }

  /**
   *
   * @param {number} idUser
   * @param {string} title
   * @returns {{ id: number, title: string, id_user: number } | undefined}
   */
  async getByTitle(idUser, title) {
    try {
      const q = `SELECT id, title, id_user FROM directories
                    WHERE id_user = $1 
                        AND title = $2 
                        AND deleted_at IS NULL`;
      const params = [idUser, title];
      return (await this.#client.query(q, params)).rows[0];
    } catch (e) {
      throw new Internal("error getting directory");
    }
  }
}

module.exports = { DirectoriesRepository };
