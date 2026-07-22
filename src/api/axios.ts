import axios from "axios";
import ApiConfig from "../config/ApiConfig";

const api = axios.create({

    baseURL: ApiConfig.BASE_URL,

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 10000,

});

export default api;