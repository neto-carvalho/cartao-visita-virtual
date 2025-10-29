/**
 * Utilitários para padronização de respostas da API
 */
class ResponseHelper {
    /**
     * Resposta de sucesso
     */
    static success(res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de erro
     */
    static error(res, message = 'Erro interno do servidor', statusCode = 500, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de validação
     */
    static validationError(res, errors, message = 'Dados de entrada inválidos') {
        return res.status(400).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de não encontrado
     */
    static notFound(res, message = 'Recurso não encontrado') {
        return res.status(404).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de não autorizado
     */
    static unauthorized(res, message = 'Acesso não autorizado') {
        return res.status(401).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de acesso negado
     */
    static forbidden(res, message = 'Acesso negado') {
        return res.status(403).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de conflito
     */
    static conflict(res, message = 'Conflito de dados') {
        return res.status(409).json({
            success: false,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de paginação
     */
    static paginated(res, data, pagination, message = 'Dados recuperados com sucesso') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                pages: Math.ceil(pagination.total / pagination.limit),
                hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
                hasPrev: pagination.page > 1
            },
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de criação
     */
    static created(res, data, message = 'Recurso criado com sucesso') {
        return res.status(201).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de atualização
     */
    static updated(res, data, message = 'Recurso atualizado com sucesso') {
        return res.status(200).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Resposta de exclusão
     */
    static deleted(res, message = 'Recurso excluído com sucesso') {
        return res.status(200).json({
            success: true,
            message,
            timestamp: new Date().toISOString()
        });
    }
}

module.exports = ResponseHelper;








