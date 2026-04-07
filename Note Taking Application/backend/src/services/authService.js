import userDAO from "../dao/userdao.js";

// Traceability:
// UC-01 User creates an account.
// UC-02 User logs in.

// Traceability: UC-02 authenticates the user and records a successful login.
// Login user with email + password
const login = async (email, password) => {
  // Step 1: find matching user
  const user = await userDAO.findByEmailAndPassword(email, password);

  // Step 2: if not found, return null
  if (!user) {
    return null;
  }

  // Step 3: increment login count in database
  await userDAO.incrementLoginCount(user.userid);

  // Step 4: update object value locally 
  user.loggedin += 1;

  // Step 5: return authenticated user
  return user;
};

// Traceability: UC-01 validates uniqueness and creates a new user account.
// Register new user
const register = async (email, password) => {
  // Step 1: check if email already exists
  const existingUser = await userDAO.findByEmail(email);

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Step 2: create new user
  const newUser = await userDAO.createUser(email, password);

  return newUser;
};

export default {
  login,
  register
};