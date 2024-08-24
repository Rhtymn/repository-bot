const { UsersRepository } = require("../repository/users");

class UsersUsecase {
  /**
   * postgres client
   * @type { UsersRepository }
   */
  #userRepository;

  /**
   *
   * @param { UsersRepository } userRepository
   */
  constructor(userRepository) {
    this.#userRepository = userRepository;
  }

  /**
   *
   * @param {string} phoneNumber
   */
  async register(phoneNumber) {
    try {
      const users = await this.#userRepository.getByPhoneNumber(phoneNumber);
      if (users) {
        throw new Error("already registered!");
      }

      await this.#userRepository.save(phoneNumber);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = { UsersUsecase };
