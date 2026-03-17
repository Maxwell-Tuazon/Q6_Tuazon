import axios from 'axios'
import { SERVICE_LIST_REQUEST, SERVICE_LIST_SUCCESS, SERVICE_LIST_FAIL } from '../constants/serviceConstants'

const listServices = () => async (dispatch) => {
    try {
        dispatch({ type: SERVICE_LIST_REQUEST })
        const {data} = await axios.get('/api/v1/services/list/')
        dispatch({
            type: SERVICE_LIST_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: SERVICE_LIST_FAIL,
            payload: error.response && error.response.data.detail ? error.response.data.detail : error.message,
        })
    }
}

export { listServices }
