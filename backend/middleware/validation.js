/**
 * Middleware de validação de dados
 */
class ValidationMiddleware {
    /**
     * Validar dados de entrada
     */
    static validate(schema) {
        return (req, res, next) => {
            try {
                const { error, value } = schema.validate(req.body, {
                    abortEarly: false,
                    stripUnknown: true
                });

                if (error) {
                    const errors = error.details.map(detail => ({
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: detail.context?.value
                    }));

                    return res.status(400).json({
                        success: false,
                        message: 'Dados de entrada inválidos',
                        errors
                    });
                }

                req.body = value;
                next();
            } catch (err) {
                console.error('Erro na validação:', err);
                res.status(500).json({
                    success: false,
                    message: 'Erro interno na validação'
                });
            }
        };
    }

    /**
     * Validar parâmetros da URL
     */
    static validateParams(schema) {
        return (req, res, next) => {
            try {
                const { error, value } = schema.validate(req.params);

                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: 'Parâmetros inválidos',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                }

                req.params = value;
                next();
            } catch (err) {
                console.error('Erro na validação de parâmetros:', err);
                res.status(500).json({
                    success: false,
                    message: 'Erro interno na validação'
                });
            }
        };
    }

    /**
     * Validar query parameters
     */
    static validateQuery(schema) {
        return (req, res, next) => {
            try {
                const { error, value } = schema.validate(req.query);

                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: 'Parâmetros de consulta inválidos',
                        errors: error.details.map(detail => ({
                            field: detail.path.join('.'),
                            message: detail.message
                        }))
                    });
                }

                req.query = value;
                next();
            } catch (err) {
                console.error('Erro na validação de query:', err);
                res.status(500).json({
                    success: false,
                    message: 'Erro interno na validação'
                });
            }
        };
    }
}

module.exports = ValidationMiddleware;








