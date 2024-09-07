const { Unauthorized, BadRequest } = require("../exceptions");
const { DirectoriesRepository } = require("../repository/directories");
const { UsersRepository } = require("../repository/users");
const { LinksRepository } = require("../repository/links");
const { Transactor } = require("../utils/transactor");

/**
 * @typedef {{ id: number, title:string, id_user: number }} Directory
 */
/**
 * @typedef {{ id: number, phone_number: string }} User
 */

class DirectoriesUsecase {
  /**
   * directory repository
   * @type { DirectoriesRepository }
   */
  #directoriesRepository;

  /**
   * user repository
   * @type { UsersRepository }
   */
  #usersRepository;

  /**
   * link repository
   * @type { LinksRepository }
   */
  #linksRepository;

  /**
   * @type { Transactor }
   */
  #transactor;

  /**
   *
   * @param {{
   *    directoriesRepository: DirectoriesRepository,
   *    usersRepository: UsersRepository
   *    linksRepository: LinksRepository
   *    transactor: Transactor
   * }} opts
   */
  constructor(opts) {
    this.#directoriesRepository = opts.directoriesRepository;
    this.#usersRepository = opts.usersRepository;
    this.#linksRepository = opts.linksRepository;
    this.#transactor = opts.transactor;
  }

  /**
   *
   * @param {User} user
   * @param {Directory} directory
   */
  async add(user, directory) {
    try {
      const u = await this.#usersRepository.getByPhoneNumber(user.phone_number);

      if (!u) {
        throw new Unauthorized("user not registered!");
      }

      const dir = await this.#directoriesRepository.getByTitle(
        u.id,
        directory.title
      );

      if (dir && dir.id_user === u.id) {
        throw new BadRequest("directory already created!");
      }

      await this.#directoriesRepository.save(u.id, directory.title);
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param {User} user
   * @param {Directory} directory
   */
  async delete(user, directory) {
    try {
      await this.#transactor.withinTransaction(async () => {
        const u = await this.#usersRepository.getByPhoneNumber(
          user.phone_number
        );

        if (!u) {
          throw new Unauthorized("user not registered!");
        }

        const dir = await this.#directoriesRepository.getByTitle(
          u.id,
          directory.title
        );

        if (!dir) {
          throw new BadRequest("directory not found!");
        }

        if (dir.id_user !== u.id) {
          throw new BadRequest("directory not found!");
        }

        await this.#directoriesRepository.softDeleteByTitle(
          u.id,
          directory.title
        );

        await this.#linksRepository.softBatchDeleteByDirectory(dir.id);
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param {User} user
   * @param {Directory} directory
   * @param {string} newTitle
   */
  async update(user, directory, newTitle) {
    try {
      const u = await this.#usersRepository.getByPhoneNumber(user.phone_number);

      if (!u) {
        throw new Unauthorized("user not registered!");
      }

      const dir = await this.#directoriesRepository.getByTitle(
        u.id,
        directory.title
      );

      if (!dir) {
        throw new BadRequest("directory not found!");
      }

      if (dir.id_user !== u.id) {
        throw new BadRequest("directory not found!");
      }

      if (dir.title === newTitle) {
        return;
      }

      dir.id_user = u.id;
      await this.#directoriesRepository.update(dir, newTitle);
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param {User} user
   * @returns {Directory[]}
   */
  async getDirectories(user) {
    try {
      const u = await this.#usersRepository.getByPhoneNumber(user.phone_number);

      if (!u) {
        throw new Unauthorized("user not registered!");
      }

      return await this.#directoriesRepository.getAll(u.id);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = { DirectoriesUsecase };
