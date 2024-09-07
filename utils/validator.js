/**
 *
 * @param { string } url
 * @returns { boolean }
 */
const isURL = (url) => {
  const regex =
    /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?\/?$/;

  return regex.test(url);
};

module.exports = { isURL };
