import axios from "axios";

export const createUser = async (userData) => {
  return axios.post("http://localhost:8080/users", userData);
};