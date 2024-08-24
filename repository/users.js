const { Client } = require("pg");

class UsersRepository {
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
   * @param {string} phoneNumber
   */
  async save(phoneNumber) {
    try {
      const q = `INSERT INTO users(phone_number) VALUES ($1)`;
      const params = [phoneNumber];
      await this.#client.query(q, params);
    } catch (e) {
      throw new Error("error creating users");
    }
  }

  /**
   *
   * @param {string} phoneNumber
   * @returns {{ id: number, phone_number: string } | undefined }
   */
  async getByPhoneNumber(phoneNumber) {
    try {
      const q = `SELECT id, phone_number FROM users WHERE phone_number = $1`;
      const params = [phoneNumber];
      return (await this.#client.query(q, params)).rows[0];
    } catch (e) {
      throw new Error("error get users");
    }
  }
}

module.exports = { UsersRepository };
