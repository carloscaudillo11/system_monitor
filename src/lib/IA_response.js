import LlamaAI from 'llamaai';

const llamaAPI = new LlamaAI(process.env.LLAMA_TOKEN);

const IA_response = async (apiRequestJson) => {
    try {
        const response = await llamaAPI.run(apiRequestJson);
        return response;
    } catch (error) {
        return error;
    }
};

export default IA_response;
