const { Client } = require("pg");
const { Internal } = require("../exceptions");

/**
 * @typedef {{ id: number, url: string, title:string, id_directory }} Link
 */
/**
 * @typedef {{ id: number, phone_number: string }} User
 */

class LinksRepository {
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
   * @param {Directory} directory
   * @param {Link} link
   */
  async save(link) {
    try {
      const q = `INSERT INTO links(url, title, id_directory) VALUES($1, $2, $3)`;
      const params = [link.url, link.title, link.id_directory];
      await this.#client.query(q, params);
    } catch (e) {
      throw new Internal("error creating link");
    }
  }

  /**
   *
   * @param {number} idDirectory
   * @param {string} title
   * @returns {Link}
   */
  async getLinkByTitle(idDirectory, title) {
    try {
      const q = `SELECT id, url, title, id_directory
                    FROM links
                   WHERE id_directory = $1
                    AND title = $2
                    AND deleted_at IS NULL`;
      const params = [idDirectory, title];
      return (await this.#client.query(q, params)).rows[0];
    } catch (e) {
      throw new Internal("error get link");
    }
  }
}

module.exports = { LinksRepository };
