import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IChatUiState {
    editingMessage:{
        id:string;
        content:string
    } | null;
}


const initialState: IChatUiState ={
    editingMessage:null
}

const chatUiSlice = createSlice({
    name : "chatUi",
    initialState,
    reducers:{
        setEditingMessage:(state,action:PayloadAction<{id:string;content:string} | null>)=>{
            state.editingMessage= action.payload;
        }
    }
})

export const {setEditingMessage}= chatUiSlice.actions;
export default chatUiSlice.reducer;