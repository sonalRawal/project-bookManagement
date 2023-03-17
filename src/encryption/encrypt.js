const bcrypt = require("bcrypt");
const hashPassword = async (password, saltRounds = 2) => {
  // Hash password
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (plaintextPassword, hash) =>{
  const result = await bcrypt.compare(plaintextPassword, hash);
  return result;
}

module.exports= {hashPassword, comparePassword};
