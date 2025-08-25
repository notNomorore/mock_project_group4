import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const MOCK_API_URL = "https://66f2e1d371c84d805877e7ff.mockapi.io/users";

// =====================
// THUNKS
// =====================

// login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(MOCK_API_URL);
      const user = data.find(
        (u) => u.email === email && u.password === password && u.status === "active"
      );
      if (!user) return rejectWithValue("Invalid credentials or inactive account");

      const token = `mock_token_${user.id}`;
      localStorage.setItem("token", token);

      return { user, token };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// fetch users
export const fetchUsers = createAsyncThunk("auth/fetchUsers", async () => {
  const { data } = await axios.get(MOCK_API_URL);
  return data;
});

// create user
export const createUser = createAsyncThunk("auth/createUser", async (userData) => {
  const { data } = await axios.post(MOCK_API_URL, userData);
  return data;
});

// update user
export const updateUser = createAsyncThunk(
  "auth/updateUser",
  async ({ id, updates }) => {
    const { data } = await axios.put(`${MOCK_API_URL}/${id}`, updates);
    return data;
  }
);

// delete user
export const deleteUser = createAsyncThunk("auth/deleteUser", async (id) => {
  await axios.delete(`${MOCK_API_URL}/${id}`);
  return id;
});

// =====================
// SLICE
// =====================
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  users: [],
  selectedUserId: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
    changeSelectedUser: (state, action) => {
      state.selectedUserId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetch users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })

      // create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })

      // update user
      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
      })

      // delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export const { logout, changeSelectedUser } = authSlice.actions;
export default authSlice.reducer;
