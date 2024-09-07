const { Client } = require("pg");
const { Internal } = require("../exceptions");

/**
 * @typedef {{ id:number, title:string, id_user:number }} Directory
 */

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
   * @returns {Directory | undefined}
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

  /**
   *
   * @param {number} idUser
   * @returns {Directory[] | undefined}
   */
  async getAll(idUser) {
    try {
      const q = `SELECT id, title, id_user 
                  FROM directories
                 WHERE id_user = $1 
                  AND deleted_at IS NULL`;
      const params = [idUser];
      return (await this.#client.query(q, params)).rows;
    } catch (e) {
      throw new Internal("error get directories");
    }
  }

  /**
   *
   * @param {number} id
   * @returns {Promise<Directory> | undefined}
   */
  async getById(id) {
    try {
      const q = `SELECT id, title, id_user
                    FROM directories
                  WHERE id = $1
                    AND deleted_at IS NULL`;
      const params = [id];
      return (await this.#client.query(q, params)).rows[0];
    } catch (e) {
      throw new Error("error get directory");
    }
  }

  /**
   *
   * @param {number} idUser
   * @param {string} title
   */
  async softDeleteByTitle(idUser, title) {
    try {
      const q = `UPDATE directories
                  SET deleted_at = now()
                 WHERE id_user = $1
                  AND title = $2`;
      const params = [idUser, title];
      await this.#client.query(q, params);
    } catch (e) {
      throw new Internal("error soft delete directory");
    }
  }

  /**
   *
   * @param {{ id:number, title:string, id_user:number }} directory
   */
  async update(directory, newTitle) {
    try {
      const q = `UPDATE directories
                  SET title = $1,
                      updated_at = now()
                 WHERE id_user = $2 
                    AND title = $3
                    AND deleted_at IS NULL`;
      const params = [newTitle, directory.id_user, directory.title];
      this.#client.query(q, params);
    } catch (e) {
      throw new Internal("error updating directory");
    }
  }
}

module.exports = { DirectoriesRepository };
