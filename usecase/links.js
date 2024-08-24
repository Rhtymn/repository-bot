const { BadRequest, Unauthorized } = require("../exceptions");
const { DirectoriesRepository } = require("../repository/directories");
const { LinksRepository } = require("../repository/links");
const { UsersRepository } = require("../repository/users");

/**
 * @typedef {{ id: number, title:string, id_user: number }} Directory
 */
/**
 * @typedef {{ id: number, phone_number: string }} User
 */
/**
 * @typedef {{ id: number, url: string, title:string, id_directory }} Link
 */

class LinksUsecase {
  /**
   * links repository
   * @type { LinksRepository }
   */
  #linksRepository;

  /**
   * directories repository
   * @type { DirectoriesRepository }
   */
  #directoriesRepository;

  /**
   * users repository
   * @type { UsersRepository }
   */
  #usersRepository;

  /**
   *
   * @param {{
   *    linksRepository: LinksRepository,
   *    directoriesRepository: DirectoriesRepository,
   *    usersRepository: UsersRepository
   *  }} opts
   */
  constructor(opts) {
    this.#linksRepository = opts.linksRepository;
    this.#directoriesRepository = opts.directoriesRepository;
    this.#usersRepository = opts.usersRepository;
  }

  /**
   *
   * @param {User} user
   * @param {Directory} directory
   * @returns {Promise<Link[]> | undefined}
   */
  async getAll(user, directory) {
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

      return await this.#linksRepository.getAll(dir.id);
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param {User} user
   * @param {Directory} directory
   * @param {Link} link
   */
  async save(user, directory, link) {
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

      const l = await this.#linksRepository.getLinkByTitle(dir.id, link.title);

      if (l) {
        throw new BadRequest("link title already used!");
      }

      link.id_directory = dir.id;
      await this.#linksRepository.save(link);
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param {User} user
   * @param {Link} link
   */
  async delete(user, link) {
    try {
      const u = await this.#usersRepository.getByPhoneNumber(user.phone_number);

      if (!u) {
        throw new Unauthorized("user not registered!");
      }

      const l = await this.#linksRepository.getLinkById(link.id);

      if (!l) {
        throw new BadRequest("link not found!");
      }

      const dir = await this.#directoriesRepository.getById(l.id_directory);

      if (dir.id_user !== u.id) {
        throw new BadRequest("link not found!");
      }

      await this.#linksRepository.softDeleteById(l.id);
    } catch (e) {
      throw e;
    }
  }

  /**
   *
   * @param {User} user
   * @param {Link} link
   */
  async update(user, link) {
    try {
      const u = await this.#usersRepository.getByPhoneNumber(user.phone_number);

      if (!u) {
        throw new Unauthorized("user not registered!");
      }

      const l = await this.#linksRepository.getLinkById(link.id);

      if (!l) {
        throw new BadRequest("link not found!");
      }

      const dir = await this.#directoriesRepository.getById(l.id_directory);

      if (dir.id_user !== u.id) {
        throw new BadRequest("link not found!");
      }

      if (link.title === "-" && link.url === "-") {
        return;
      }

      if (link.title !== "-") l.title = link.title;
      if (link.url !== "-") l.url = link.url;

      await this.#linksRepository.update(l);
    } catch (e) {
      throw e;
    }
  }
}

module.exports = { LinksUsecase };
