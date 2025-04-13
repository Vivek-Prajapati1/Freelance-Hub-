import axios from 'axios';
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

// Admin Login
export const adminLogin = (formData) => async (dispatch) => {
    try {
        const res = await axios.post('/api/admin/login', formData);
        dispatch({
            type: ADMIN_LOGIN_SUCCESS,
            payload: res.data
        });
        localStorage.setItem('adminToken', res.data.token);
    } catch (err) {
        dispatch({
            type: ADMIN_LOGIN_FAIL,
            payload: err.response?.data?.message || 'Login failed'
        });
    }
};

// Get all users
export const getUsers = () => async (dispatch) => {
    try {
        const res = await axios.get('/api/admin/users');
        dispatch({
            type: GET_USERS_SUCCESS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: GET_USERS_FAIL,
            payload: err.response?.data?.message || 'Failed to fetch users'
        });
    }
};

// Get all gigs
export const getGigs = () => async (dispatch) => {
    try {
        const res = await axios.get('/api/admin/gigs');
        dispatch({
            type: GET_GIGS_SUCCESS,
            payload: res.data
        });
    } catch (err) {
        dispatch({
            type: GET_GIGS_FAIL,
            payload: err.response?.data?.message || 'Failed to fetch gigs'
        });
    }
};

// Delete user
export const deleteUser = (userId) => async (dispatch) => {
    try {
        await axios.delete(`/api/admin/users/${userId}`);
        dispatch({
            type: DELETE_USER_SUCCESS,
            payload: userId
        });
    } catch (err) {
        dispatch({
            type: DELETE_USER_FAIL,
            payload: err.response?.data?.message || 'Failed to delete user'
        });
    }
};

// Delete gig
export const deleteGig = (gigId) => async (dispatch) => {
    try {
        await axios.delete(`/api/admin/gigs/${gigId}`);
        dispatch({
            type: DELETE_GIG_SUCCESS,
            payload: gigId
        });
    } catch (err) {
        dispatch({
            type: DELETE_GIG_FAIL,
            payload: err.response?.data?.message || 'Failed to delete gig'
        });
    }
}; 