// frontend/src/redux/insights.js

// Action Types
const SET_INSIGHTS = 'insights/SET_INSIGHTS';
const ADD_INSIGHT = 'insights/ADD_INSIGHT';
const UPDATE_INSIGHT = 'insights/UPDATE_INSIGHT';
const REMOVE_INSIGHT = 'insights/REMOVE_INSIGHT';

// Action Creators
const setInsights = (insights) => ({
    type: SET_INSIGHTS,
    payload: insights
});

const addInsight = (insight) => ({
    type: ADD_INSIGHT,
    payload: insight
});

const updateInsight = (insight) => ({
    type: UPDATE_INSIGHT,
    payload: insight
});

const removeInsight = (id) => ({
    type: REMOVE_INSIGHT,
    payload: id
});

// Thunks
export const thunkGenerateInsight = (dreamIds, category) => async (dispatch) => {
    const response = await fetch('/api/insights/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_ids: dreamIds, category })
    });
    
    if (response.ok) {
        const newInsight = await response.json();
        dispatch(addInsight(newInsight));
        return newInsight;
    }
};

export const thunkLoadInsights = () => async (dispatch) => {
    const response = await fetch('/api/insights/');
    if (response.ok) {
        const insights = await response.json();
        dispatch(setInsights(insights));
    }
};

// Initial State
const initialState = {
    allInsights: {},
    currentInsight: null,
    byCategory: {
        spiritual: [],
        emotional: [],
        actionable: [],
        lucid: [],
        practical: []
    }
};

// Reducer
export default function insightsReducer(state = initialState, action) {
    switch (action.type) {
        case SET_INSIGHTS: {
            const allInsights = {};
            const byCategory = {
                spiritual: [],
                emotional: [],
                actionable: [],
                lucid: [],
                practical: []
            };
            
            action.payload.forEach(insight => {
                allInsights[insight.id] = insight;
                if (byCategory[insight.category]) {
                    byCategory[insight.category].push(insight.id);
                }
            });
            
            return { ...state, allInsights, byCategory };
        }
        case ADD_INSIGHT:
            return {
                ...state,
                allInsights: {
                    ...state.allInsights,
                    [action.payload.id]: action.payload
                },
                byCategory: {
                    ...state.byCategory,
                    [action.payload.category]: [
                        ...state.byCategory[action.payload.category],
                        action.payload.id
                    ]
                }
            };
        case UPDATE_INSIGHT:
            return {
                ...state,
                allInsights: {
                    ...state.allInsights,
                    [action.payload.id]: action.payload
                }
            };
        case REMOVE_INSIGHT: {
            const newState = { ...state };
            const insight = state.allInsights[action.payload];
            delete newState.allInsights[action.payload];
            if (insight && newState.byCategory[insight.category]) {
                newState.byCategory[insight.category] = 
                    newState.byCategory[insight.category].filter(id => id !== action.payload);
            }
            return newState;
        }
        default:
            return state;
    }
}