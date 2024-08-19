import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: "",
    name: "",
    email: "",
    location: "",
    locale: "",
    requestIds: [""]
  },
  reducers: {
    newRequest: (state, action: PayloadAction<string>) => {
      if (state.requestIds.length === 2 && state.requestIds[0] === "") state.requestIds = [action.payload];
      else state.requestIds.push(action.payload);
      return state
    },
    userData: (state, action: PayloadAction<{
      id?: string,
      username?: string,
      email?: string,
      location?: string,
      locale?: string
    }>) => {
      const { id, username, email, location, locale } = action.payload
      const newState = {
        ...state,
        id: id || state.id,
        name: username || state.name,
        email: email || state.email,
        location: location || state.location,
        locale: locale || state.locale,
        requestIds: state.requestIds
      }
      console.log(newState)
      return newState
    },
    signoutUser: (state) => {
      state = {
        id: "",
        name: "",
        email: "",
        location: "",
        locale: "",
        requestIds: [""]
      }
      return state
    }
  }
})

export const { newRequest, userData, signoutUser } = userSlice.actions

export const requestSlice = createSlice({
  name: 'request',
  initialState: {
    id: "",
    from: "",
    to: "",
    type: "",
    parcel: "",
    description: "",
  },
  reducers: {
    id: (state, action: PayloadAction<string>) => {
      state = { ...state, id: action.payload }
      return state
    },
    route: (state, action: PayloadAction<{ from: string, to: string }>) => {
      state = { ...state, from: action.payload.from, to: action.payload.to }
      return state
    },
    parcel: (state, action: PayloadAction<string>) => {
      state = { ...state, parcel: action.payload }
      return state
    },
    type: (state, action: PayloadAction<'order' | 'delivery'>) => {
      state = { ...state, type: action.payload }
      return state
    },
    description: (state, action: PayloadAction<string>) => {
      state = { ...state, description: action.payload }
      return state
    },
    wipe: (state) => {
      state = {
        id: "",
        from: "",
        to: "",
        type: "",
        parcel: "",
        description: "",
      }
      return state
    }
  }
})

export const { id, route, parcel, type, description, wipe } = requestSlice.actions
export default { userReducer: userSlice.reducer, requestReducer: requestSlice.reducer }
