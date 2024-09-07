const commandsInfo = `1. !repo commands -> get all commands information
2. !repo register -> Registering user on bot application
3. !repo dir add [title] -> Create directory
4. !repo dir show -> Show all directories
5. !repo dir delete [title] -> Delete directory by title
6. !repo dir update [title] [new title] -> Update directory title
7. !repo dir show [title] -> Show links attached on directory
8. !repo link add [directory name] [url] [title] -> Attach link on selected directory
9. !repo link delete [id link] -> Delete link
10. !repo link update [id link] [- | new url] [- | new title] -> Update link url or title, Use "-" to mark no change.`;

module.exports = { commandsInfo };
