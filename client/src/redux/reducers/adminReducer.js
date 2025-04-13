import {
    ADMIN_LOGIN_SUCCESS,
    ADMIN_LOGIN_FAIL,
    GET_USERS_SUCCESS,
    GET_USERS_FAIL,
    GET_GIGS_SUCCESS,
    GET_GIGS_FAIL,
    DELETE_USER_SUCCESS,
    DELETE_USER_FAIL,
    DELETE_GIG_SUCCESS,
    DELETE_GIG_FAIL
} from '../types';

const initialState = {
    token: localStorage.getItem('adminToken'),
    isAuthenticated: false,
    loading: true,
    admin: null,
    users: [],
    gigs: [],
    error: null
};

export default function (state = initialState, action) {
    const { type, payload } = action;

    switch (type) {
        case ADMIN_LOGIN_SUCCESS:
            localStorage.setItem('adminToken', payload.token);
            return {
                ...state,
                ...payload,
                isAuthenticated: true,
                loading: false
            };
        case ADMIN_LOGIN_FAIL:
            localStorage.removeItem('adminToken');
            return {
                ...state,
                token: null,
                isAuthenticated: false,
                loading: false,
                error: payload
            };
        case GET_USERS_SUCCESS:
            return {
                ...state,
                users: payload,
                loading: false
            };
        case GET_USERS_FAIL:
            return {
                ...state,
                users: [],
                loading: false,
                error: payload
            };
        case GET_GIGS_SUCCESS:
            return {
                ...state,
                gigs: payload,
                loading: false
            };
        case GET_GIGS_FAIL:
            return {
                ...state,
                gigs: [],
                loading: false,
                error: payload
            };
        case DELETE_USER_SUCCESS:
            return {
                ...state,
                users: state.users.filter(user => user._id !== payload),
                loading: false
            };
        case DELETE_USER_FAIL:
            return {
                ...state,
                loading: false,
                error: payload
            };
        case DELETE_GIG_SUCCESS:
            return {
                ...state,
                gigs: state.gigs.filter(gig => gig._id !== payload),
                loading: false
            };
        case DELETE_GIG_FAIL:
            return {
                ...state,
                loading: false,
                error: payload
            };
        default:
            return state;
    }
} 