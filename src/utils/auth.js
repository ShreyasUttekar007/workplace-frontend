import localforage from "localforage";

export const getUser = async () => {
  try {
    const userName = await localforage.getItem("userName");
    const email = await localforage.getItem("email");
    const id = await localforage.getItem("ID");
    const roles = await localforage.getItem("roles");
    if (userName && email && id && roles) {
      return { userName, email, id, roles };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user data", error);
    return null;
  }
};

export const isLoggedIn = async () => {
  try {
    const token = await localforage.getItem("token");
    return !!token;
  } catch (error) {
    console.error("Failed to fetch token", error);
    return false;
  }
};

export const hasRole = async (role) => {
  try {
    const roles = await localforage.getItem("roles");
    return roles ? roles.includes(role) : false;
  } catch (error) {
    console.error("Failed to fetch roles", error);
    return false;
  }
};
