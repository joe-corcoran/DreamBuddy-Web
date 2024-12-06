// frontend/src/redux/dreamEntities.js
import { getApiUrl } from '../config';
import { csrfFetch } from './csrf';

// Action Types
const SET_DREAM_ENTITIES = 'dreamEntities/SET_DREAM_ENTITIES';
const ADD_DREAM_ENTITY = 'dreamEntities/ADD_DREAM_ENTITY';
const UPDATE_DREAM_ENTITY = 'dreamEntities/UPDATE_DREAM_ENTITY';
const REMOVE_DREAM_ENTITY = 'dreamEntities/REMOVE_DREAM_ENTITY';
const SET_LOADING = 'dreamEntities/SET_LOADING';
const SET_ERROR = 'dreamEntities/SET_ERROR';

// Action Creators
const setDreamEntities = (entities) => ({
    type: SET_DREAM_ENTITIES,
    payload: entities
});

const addDreamEntity = (entity) => ({
    type: ADD_DREAM_ENTITY,
    payload: entity
});

const updateDreamEntity = (entity) => ({
    type: UPDATE_DREAM_ENTITY,
    payload: entity
});

const removeDreamEntity = (entityId) => ({
    type: REMOVE_DREAM_ENTITY,
    payload: entityId
});

const setLoading = (isLoading) => ({
    type: SET_LOADING,
    payload: isLoading
});

const setError = (error) => ({
    type: SET_ERROR,
    payload: error
});

// Thunks
export const fetchDreamEntities = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/dream-entities'));
        const entities = await response.json();
        dispatch(setDreamEntities(entities));
        return { success: true, entities };
    } catch (error) {
        console.error('Error fetching dream entities:', error);
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const createDreamEntity = (entityData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl('/api/dream-entities'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entityData)
        });
        const entity = await response.json();
        dispatch(addDreamEntity(entity));
        return { success: true, entity };
    } catch (error) {
        console.error('Error creating dream entity:', error);
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateDreamEntityThunk = (entityId, entityData) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await csrfFetch(getApiUrl(`/api/dream-entities/${entityId}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entityData)
        });
        const entity = await response.json();
        dispatch(updateDreamEntity(entity));
        return { success: true, entity };
    } catch (error) {
        console.error('Error updating dream entity:', error);
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const deleteDreamEntity = (entityId) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        await csrfFetch(getApiUrl(`/api/dream-entities/${entityId}`), {
            method: 'DELETE'
        });
        dispatch(removeDreamEntity(entityId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting dream entity:', error);
        dispatch(setError(error.message));
        return { error: error.message };
    } finally {
        dispatch(setLoading(false));
    }
};

export const incrementEntityFrequency = (entityId) => async (dispatch) => {
    try {
        const response = await csrfFetch(getApiUrl(`/api/dream-entities/${entityId}/increment`), {
            method: 'POST'
        });
        const entity = await response.json();
        dispatch(updateDreamEntity(entity));
        return { success: true, entity };
    } catch (error) {
        console.error('Error incrementing entity frequency:', error);
        return { error: error.message };
    }
};

// Initial State
const initialState = {
    entities: [],
    isLoading: false,
    error: null
};

// Reducer
export default function dreamEntitiesReducer(state = initialState, action) {
    switch (action.type) {
        case SET_DREAM_ENTITIES:
            return {
                ...state,
                entities: action.payload,
                error: null
            };
        case ADD_DREAM_ENTITY:
            return {
                ...state,
                entities: [...state.entities, action.payload],
                error: null
            };
        case UPDATE_DREAM_ENTITY:
            return {
                ...state,
                entities: state.entities.map(entity =>
                    entity.id === action.payload.id ? action.payload : entity
                ),
                error: null
            };
        case REMOVE_DREAM_ENTITY:
            return {
                ...state,
                entities: state.entities.filter(entity => entity.id !== action.payload),
                error: null
            };
        case SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };
        case SET_ERROR:
            return {
                ...state,
                error: action.payload
            };
        default:
            return state;
    }
}