class Unauthorized extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Unauthorized";
  }
}

class BadRequest extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Bad Request";
  }
}

class Internal extends Error {
  constructor(msg) {
    super(msg);
    this.name = "Internal";
  }
}

module.exports = { Unauthorized, BadRequest, Internal };
