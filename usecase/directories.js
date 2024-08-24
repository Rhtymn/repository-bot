const { Unauthorized, BadRequest } = require("../exceptions");
const { DirectoriesRepository } = require("../repository/directories");
const { UsersRepository } = require("../repository/users");

class DirectoriesUsecase {
  /**
   * directory repository
   * @type { DirectoriesRepository }
   */
  #directoriesRepository;

  /**
   * directory repository
   * @type { UsersRepository }
   */
  #usersRepository;

  /**
   *
   * @param {{
   *    directoriesRepository: DirectoriesRepository,
   *    usersRepository: UsersRepository
   * }} opts
   */
  constructor(opts) {
    this.#directoriesRepository = opts.directoriesRepository;
    this.#usersRepository = opts.usersRepository;
  }

  /**
   *
   * @param {string} phoneNumber
   * @param {string} title
   */
  async add(phoneNumber, title) {
    try {
      const users = await this.#usersRepository.getByPhoneNumber(phoneNumber);

      if (!users) {
        throw new Unauthorized("user not registered!");
      }

      const dir = await this.#directoriesRepository.getByTitle(users.id, title);

      if (dir) {
        throw new BadRequest("directory already created");
      }

      await this.#directoriesRepository.save(users.id, title);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = { DirectoriesUsecase };
