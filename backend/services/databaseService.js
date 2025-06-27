const { Contact, Advisor, User, sequelize } = require('../models'); // Asegúrate que sequelize aquí es la instancia ya configurada
const GeminiService = require('./geminiService');
const logger = require('../utils/logger');

class DatabaseService {
    constructor() {
        this.geminiService = new GeminiService();
    }

    /**
     * Inicializa la base de datos de forma segura.
     * Verifica la conexión y sincroniza modelos (solo en desarrollo).
     */
    async initialize() {
        try {
            await sequelize.authenticate();
            logger.info('Conexión con la base de datos establecida correctamente.');

            // Sync solo se debe usar en desarrollo. En producción se usan migraciones.
            // force: false para no borrar datos existentes al reiniciar.
            if (process.env.NODE_ENV !== 'production') {
                await sequelize.sync({ force: false }); // O { alter: true } si quieres que intente modificar tablas
                logger.info('Tablas de la base de datos sincronizadas (modo desarrollo).');
            } else {
                logger.info('Sincronización de BD omitida (modo producción). Usar migraciones.');
            }

            await this.createDefaultUsers();
            await this.createDefaultAdvisors(); // Podrías añadir esto si es necesario

        } catch (error) {
            logger.error('No se pudo inicializar la base de datos.', { error: error.message, stack: error.stack });
            throw error; // Relanzar para que la aplicación principal pueda manejarlo
        }
    }

    /**
     * Crea usuarios por defecto de forma segura, hasheando contraseñas.
     * Este método asume que el hook beforeCreate en el modelo User se encarga del hasheo.
     */
    async createDefaultUsers() {
        try {
            const userCount = await User.count();
            if (userCount === 0) {
                const defaultUsers = [
                    { username: 'Chispadelic', password: 'Svernis1Password!', role: 'admin' },
                    { username: 'Kimbowimbo', password: 'corazonKPassword!', role: 'admin' },
                    // Puedes añadir más usuarios por defecto aquí si es necesario
                ];

                // Crear usuarios uno por uno para asegurar que el hook de hasheo se ejecute correctamente (aunque bulkCreate también debería funcionar con hooks bien definidos)
                for (const userData of defaultUsers) {
                    await User.create(userData);
                }
                logger.info('Usuarios por defecto creados de forma segura.');
            }
        } catch (error) {
            logger.error('Error al crear usuarios por defecto.', { error: error.message, stack: error.stack });
            // No relanzar el error necesariamente, la app podría funcionar sin usuarios por defecto
        }
    }

    /**
     * Crea asesores por defecto si no existen.
     */
    async createDefaultAdvisors() {
        try {
            const advisorCount = await Advisor.count();
            if (advisorCount === 0) {
                const defaultAdvisors = [
                    { name: 'Asesor Alfa', email: 'alfa@example.com', isActive: true, performanceScore: 80, maxContacts: 50 },
                    { name: 'Asesor Beta', email: 'beta@example.com', isActive: true, performanceScore: 75, maxContacts: 40 },
                ];
                await Advisor.bulkCreate(defaultAdvisors);
                logger.info('Asesores por defecto creados.');
            }
        } catch (error) {
            logger.error('Error al crear asesores por defecto.', { error: error.message });
        }
    }


    /**
     * Crea un nuevo contacto, realizando análisis de calidad con Gemini.
     * @param {object} contactData - Datos del contacto.
     * @returns {Promise<object>} - El contacto creado.
     */
    async createContact(contactData) {
        const transaction = await sequelize.transaction();
        try {
            // Es buena idea validar contactData aquí antes de enviarla a Gemini o a la BD.
            if (!contactData.name || !contactData.phone) {
                throw new Error("Nombre y teléfono son requeridos para crear un contacto.");
            }

            const analysis = await this.geminiService.analyzeContact(contactData);
            
            // Añadir resultados del análisis a contactData para guardarlos
            // Asegúrate que el modelo Contact tiene los campos para qualityScore, issues (podría ser JSON), etc.
            const contactToCreate = {
                ...contactData,
                qualityScore: analysis.qualityScore,
                // Podrías querer guardar `analysis.issues` y `analysis.recommendations` también
                // Si tu modelo Contact tiene un campo JSON para `aiAnalysisDetails`:
                aiAnalysisDetails: analysis.aiAnalysisDetails || null, // Guardar el detalle del análisis de IA
                // Otros campos basados en el análisis
                isSuspicious: analysis.isSuspiciousByAI || analysis.isSuspiciousByPattern,
            };

            const contact = await Contact.create(contactToCreate, { transaction });

            await transaction.commit();
            logger.info('Contacto creado con éxito y análisis de IA.', { contactId: contact.id, qualityScore: contact.qualityScore });
            return contact;
        } catch (error) {
            await transaction.rollback();
            logger.error('Error al crear contacto.', { error: error.message, contactData });
            throw error;
        }
    }

    /**
     * Obtiene contactos, con opción de filtrado y paginación.
     * @param {object} filters - Objeto con filtros (ej. status, assignedAdvisorId).
     * @param {object} pagination - Objeto con paginación (ej. page, pageSize).
     * @returns {Promise<object>} - Objeto con contactos y conteo total.
     */
    async getContacts(filters = {}, pagination = { page: 1, pageSize: 20 }) {
        try {
            const where = {};
            if (filters.status) where.status = filters.status;
            if (filters.assignedAdvisorId) where.assignedAdvisorId = filters.assignedAdvisorId;
            // Añadir más filtros según sea necesario (ej. por qualityScore, fecha, etc.)

            const { count, rows } = await Contact.findAndCountAll({
                where,
                include: [{ model: Advisor, as: 'advisor', attributes: ['id', 'name', 'email'] }], // Incluir datos del asesor
                limit: pagination.pageSize,
                offset: (pagination.page - 1) * pagination.pageSize,
                order: [['createdAt', 'DESC']] // Ordenar por defecto
            });

            return { totalContacts: count, contacts: rows, totalPages: Math.ceil(count / pagination.pageSize), currentPage: pagination.page };
        } catch (error) {
            logger.error('Error al obtener contactos.', { error: error.message, filters });
            throw error;
        }
    }

    /**
     * Actualiza un contacto existente.
     * @param {number} contactId - ID del contacto a actualizar.
     * @param {object} updateData - Datos a actualizar.
     * @returns {Promise<object>} - El contacto actualizado.
     */
    async updateContact(contactId, updateData) {
        const transaction = await sequelize.transaction();
        try {
            const contact = await Contact.findByPk(contactId, { transaction });
            if (!contact) {
                throw new Error(`Contacto con ID ${contactId} no encontrado.`);
            }

            // Opcional: Re-analizar con Gemini si ciertos campos cambian
            const criticalFieldsChanged = ['name', 'phone', 'email'].some(field => updateData[field] && updateData[field] !== contact[field]);
            if (criticalFieldsChanged && this.geminiService) {
                const tempContactDataForAnalysis = { ...contact.get({ plain: true }), ...updateData };
                const analysis = await this.geminiService.analyzeContact(tempContactDataForAnalysis);
                updateData.qualityScore = analysis.qualityScore;
                updateData.aiAnalysisDetails = analysis.aiAnalysisDetails || contact.aiAnalysisDetails;
                updateData.isSuspicious = analysis.isSuspiciousByAI || analysis.isSuspiciousByPattern;
                 logger.info(`Re-análisis de IA para contacto ${contactId} debido a cambios. QS: ${analysis.qualityScore}`);
            }

            const updatedContact = await contact.update(updateData, { transaction });
            await transaction.commit();
            logger.info(`Contacto ${contactId} actualizado con éxito.`);
            return updatedContact;
        } catch (error) {
            await transaction.rollback();
            logger.error(`Error al actualizar contacto ${contactId}.`, { error: error.message, updateData });
            throw error;
        }
    }


    /**
     * Distribuye contactos a asesores usando una transacción para garantizar atomicidad.
     */
    async distributeContacts() {
        const transaction = await sequelize.transaction();
        try {
            // Obtener contactos no asignados o aquellos que necesiten reasignación (podrías tener una lógica más compleja aquí)
            const contactsToAssign = await Contact.findAll({
                where: { assignedAdvisorId: null },
                // podrías añadir `include: [{ model: Advisor, as: 'advisor'}]` si necesitas datos del asesor actual para la lógica
                transaction
            });

            if (contactsToAssign.length === 0) {
                logger.info('No hay contactos para distribuir en este momento.');
                await transaction.commit(); // Commit igual para cerrar la transacción
                return { assignments: [], message: "No hay contactos nuevos o sin asignar para distribuir." };
            }

            const activeAdvisors = await Advisor.findAll({
                where: { isActive: true },
                // Cargar `currentContactCount` y `maxContacts` es crucial aquí
                attributes: ['id', 'name', 'performanceScore', 'currentContactCount', 'maxContacts', 'isActive'],
                transaction
            });

            if (activeAdvisors.length === 0) {
                logger.warn('No hay asesores activos para la distribución.');
                await transaction.commit();
                return { assignments: [], message: "No hay asesores activos disponibles." };
            }
            
            // Usar geminiService para obtener la sugerencia de distribución
            const distributionSuggestion = await this.geminiService.suggestContactDistribution(contactsToAssign, activeAdvisors);
            
            const appliedAssignments = [];

            for (const assignment of distributionSuggestion.assignments) {
                // Actualizar el contacto
                await Contact.update(
                    { assignedAdvisorId: assignment.advisorId },
                    { where: { id: assignment.contactId }, transaction }
                );

                // Incrementar el contador del asesor
                // Advisor.increment es una forma segura de hacerlo atómicamente
                await Advisor.increment('currentContactCount', {
                    by: 1,
                    where: { id: assignment.advisorId },
                    transaction
                });
                appliedAssignments.push(assignment);
                logger.info(`Contacto ${assignment.contactId} asignado a Asesor ${assignment.advisorId}.`);
            }

            await transaction.commit();
            const message = `Distribución completada. ${appliedAssignments.length} contactos asignados. ${distributionSuggestion.unassignedContacts.length} no asignados.`;
            logger.info(message, { logDetails: distributionSuggestion.log });

            return {
                assignments: appliedAssignments,
                unassignedContacts: distributionSuggestion.unassignedContacts,
                message,
                log: distributionSuggestion.log
            };

        } catch (error) {
            await transaction.rollback();
            logger.error('Error al distribuir contactos, transacción revertida.', { error: error.message, stack: error.stack });
            throw error;
        }
    }

    // Otros métodos del servicio (getContactById, deleteContact, getAdvisors, createAdvisor, etc.)
    // Deberían seguir un patrón similar: uso de transacciones para operaciones de escritura,
    // logging adecuado, y manejo de errores.
}

module.exports = DatabaseService;
