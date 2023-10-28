import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AppThunk} from "app/store";
import {appActions} from "app/app.reducer";
import {authAPI, LoginParamsType} from "features/auth/auth.api";
import {clearTasksAndTodolists} from "common/actions";
import {createAppAsyncThunk, handleServerAppError, handleServerNetworkError} from "common/utils";

const slice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: false,
  },
  reducers: {},
  extraReducers:(builder)=>{
    builder
      .addCase(login.fulfilled,(state,action)=>{
      state.isLoggedIn = action.payload.isLoggedIn;
    })
      .addCase(logout.fulfilled,(state,action)=>{
        state.isLoggedIn = action.payload.isLoggedIn;
      })
      .addCase(initializeApp.fulfilled,(state,action)=>{
        state.isLoggedIn = action.payload.isLoggedIn;
      })
  }
});

// thunks
export const login = createAppAsyncThunk<{isLoggedIn: boolean},LoginParamsType>
('auth/login', async (arg, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    dispatch(appActions.setAppStatus({status: "loading"}));
    const res = await authAPI.login(arg)
    if (res.data.resultCode === 0) {
      dispatch(appActions.setAppStatus({status: "succeeded"}));
      return {isLoggedIn: true};
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  } catch (error) {
    handleServerNetworkError(error, dispatch);
    return rejectWithValue(null);
  }
})


export const logout=  createAppAsyncThunk<{isLoggedIn: boolean},undefined>
('auth/logout', async (_, thunk)=>{
  const {dispatch, rejectWithValue} = thunk;
  try {
    dispatch(appActions.setAppStatus({status: "loading"}));
    const res = await authAPI.logout()
    if (res.data.resultCode === 0) {
      dispatch(clearTasksAndTodolists());
      dispatch(appActions.setAppStatus({status: "succeeded"}));
      return {isLoggedIn: false}
    } else {
      handleServerAppError(res.data, dispatch);
      return rejectWithValue(null);
    }
  }
  catch (error) {
    handleServerNetworkError(error, dispatch);
    return rejectWithValue(null);
  }
})
export const initializeApp = createAppAsyncThunk<{ isLoggedIn: boolean }, undefined>
('app/initializeApp', async (_, thunkAPI) => {
  const {dispatch, rejectWithValue} = thunkAPI;
  try {
    const res = await authAPI.me()
    if (res.data.resultCode === 0) {
      return {isLoggedIn: true}
    } else {
      handleServerNetworkError(res.data, dispatch);
      return rejectWithValue(null);
    }

  } catch (error) {
    handleServerNetworkError(error, dispatch);
    return rejectWithValue(null);
  } finally {
    dispatch(appActions.setAppInitialized({isInitialized: true}))
  }
})
export const authReducer = slice.reducer;
export const authActions = slice.actions;
export const authThunks = {login,logout,initializeApp};