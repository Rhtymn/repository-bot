const { Client } = require("pg");
const { Internal } = require("../exceptions");

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
      throw new Internal("error creating users");
    }
  }

  /**
   *
   * @param {string} phoneNumber
   * @returns {{ id: number, phone_number: string } | undefined }
   */
  async getByPhoneNumber(phoneNumber) {
    try {
      const q = `SELECT id, phone_number FROM users 
                  WHERE phone_number = $1
                    AND deleted_at IS NULL`;
      const params = [phoneNumber];
      return (await this.#client.query(q, params)).rows[0];
    } catch (e) {
      throw new Internal("error get users");
    }
  }
}

module.exports = { UsersRepository };
