class User {
  constructor(userid, user, email, loggedin) {
    this.userid = userid;
    this.user = user;        // can be null 
    this.email = email;
    this.loggedin = loggedin;
  }
}

export default User;