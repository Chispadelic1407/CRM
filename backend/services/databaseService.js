const { Contact, Advisor, User, sequelize } = require('../models');
const GeminiService = require('./geminiService');
const logger = require('../utils/logger');

class DatabaseService {
    constructor() {
        this.geminiService = new GeminiService();
    }

    /**
     * Initialize database and create tables
     */
    async initialize() {
        try {
            await sequelize.authenticate();
            logger.info('Database connection established successfully');
            
            await sequelize.sync({ alter: true });
            logger.info('Database tables synchronized');
            
            // Create default advisors if none exist
            await this.createDefaultAdvisors();
            
            // Create default users if none exist
            await this.createDefaultUsers();
            
            return true;
        } catch (error) {
            logger.error('Unable to connect to database', { error: error.message });
            throw error;
        }
    }

    /**
     * Create default advisors
     */
    async createDefaultAdvisors() {
        try {
            const advisorCount = await Advisor.count();
            if (advisorCount === 0) {
                const defaultAdvisors = [
                    {
                        name: 'Carlos Rodriguez',
                        email: 'carlos@company.com',
                        phone: '+525512345678',
                        department: 'Ventas',
                        maxContacts: 50,
                        performanceScore: 85
                    },
                    {
                        name: 'Maria Gonzalez',
                        email: 'maria@company.com',
                        phone: '+525587654321',
                        department: 'Ventas',
                        maxContacts: 60,
                        performanceScore: 92
                    },
                    {
                        name: 'Juan Martinez',
                        email: 'juan@company.com',
                        phone: '+525555555555',
                        department: 'Soporte',
                        maxContacts: 40,
                        performanceScore: 78
                    }
                ];

                await Advisor.bulkCreate(defaultAdvisors);
                logger.info('Default advisors created');
            }
        } catch (error) {
            logger.error('Error creating default advisors', { error: error.message });
        }
    }

    /**
     * Create default users
     */
    async createDefaultUsers() {
        try {
            const userCount = await User.count();
            if (userCount === 0) {
                const defaultUsers = [
                    // Admin users
                    {
                        username: 'Chispadelic',
                        password: 'Svernis1',
                        role: 'admin'
                    },
                    {
                        username: 'Kimbowimbo',
                        password: 'c0razonK',
                        role: 'admin'
                    },
                    // Advisor users
                    {
                        username: 'Rafurioso',
                        password: 'Miau1234*',
                        role: 'asesor'
                    },
                    {
                        username: 'Wero',
                        password: 'Miau1234*',
                        role: 'asesor'
                    }
                ];

                await User.bulkCreate(defaultUsers);
                logger.info('Default users created successfully');
            }
        } catch (error) {
            logger.error('Error creating default users', { error: error.message });
        }
    }

    /**
     * Create a new contact with AI analysis
     */
    async createContact(contactData) {
        try {
            // Analyze contact before saving
            const analysis = await this.geminiService.analyzeContact(contactData);
            
            const contact = await Contact.create({
                ...contactData,
                qualityScore: analysis.qualityScore,
                isValidPhone: analysis.isValidPhone,
                isComplete: analysis.isComplete,
                isSuspicious: analysis.isSuspicious,
                aiAnalysis: analysis
            });

            logger.info('Contact created with AI analysis', {
                contactId: contact.id,
                qualityScore: analysis.qualityScore,
                isValid: analysis.isValidPhone
            });

            return contact;
        } catch (error) {
            logger.error('Error creating contact', { error: error.message });
            throw error;
        }
    }

    /**
     * Get all contacts with optional filtering
     */
    async getContacts(filters = {}) {
        try {
            const whereClause = {};
            
            if (filters.status) {
                whereClause.status = filters.status;
            }
            
            if (filters.assignedAdvisorId) {
                whereClause.assignedAdvisorId = filters.assignedAdvisorId;
            }
            
            if (filters.minQualityScore) {
                whereClause.qualityScore = {
                    [sequelize.Sequelize.Op.gte]: filters.minQualityScore
                };
            }
            
            if (filters.isValidPhone !== undefined) {
                whereClause.isValidPhone = filters.isValidPhone;
            }
            
            if (filters.isSuspicious !== undefined) {
                whereClause.isSuspicious = filters.isSuspicious;
            }

            const contacts = await Contact.findAll({
                where: whereClause,
                include: [{
                    model: Advisor,
                    as: 'advisor',
                    attributes: ['id', 'name', 'email']
                }],
                order: [['qualityScore', 'DESC'], ['createdAt', 'DESC']]
            });

            return contacts;
        } catch (error) {
            logger.error('Error fetching contacts', { error: error.message });
            throw error;
        }
    }

    /**
     * Update contact with re-analysis
     */
    async updateContact(contactId, updateData) {
        try {
            const contact = await Contact.findByPk(contactId);
            if (!contact) {
                throw new Error('Contact not found');
            }

            // If critical data changed, re-analyze
            const criticalFields = ['name', 'phone', 'email'];
            const needsReanalysis = criticalFields.some(field => 
                updateData[field] && updateData[field] !== contact[field]
            );

            if (needsReanalysis) {
                const updatedContactData = { ...contact.toJSON(), ...updateData };
                const analysis = await this.geminiService.analyzeContact(updatedContactData);
                
                updateData.qualityScore = analysis.qualityScore;
                updateData.isValidPhone = analysis.isValidPhone;
                updateData.isComplete = analysis.isComplete;
                updateData.isSuspicious = analysis.isSuspicious;
                updateData.aiAnalysis = analysis;
            }

            await contact.update(updateData);
            
            logger.info('Contact updated', {
                contactId: contactId,
                reanalyzed: needsReanalysis
            });

            return contact;
        } catch (error) {
            logger.error('Error updating contact', { error: error.message });
            throw error;
        }
    }

    /**
     * Delete contact
     */
    async deleteContact(contactId) {
        try {
            const contact = await Contact.findByPk(contactId);
            if (!contact) {
                throw new Error('Contact not found');
            }

            await contact.destroy();
            logger.info('Contact deleted', { contactId: contactId });
            
            return true;
        } catch (error) {
            logger.error('Error deleting contact', { error: error.message });
            throw error;
        }
    }

    /**
     * Analyze entire database health
     */
    async analyzeDatabaseHealth() {
        try {
            const contacts = await Contact.findAll();
            const analysis = await this.geminiService.analyzeDatabaseHealth(contacts);
            
            logger.info('Database health analysis completed', {
                totalContacts: analysis.totalContacts,
                validContacts: analysis.validContacts,
                suspiciousContacts: analysis.suspiciousContacts
            });

            return analysis;
        } catch (error) {
            logger.error('Error analyzing database health', { error: error.message });
            throw error;
        }
    }

    /**
     * Clean database by removing suspicious and invalid contacts
     */
    async cleanDatabase(options = {}) {
        try {
            const results = {
                removed: 0,
                updated: 0,
                errors: []
            };

            // Remove suspicious contacts if requested
            if (options.removeSuspicious) {
                const suspiciousContacts = await Contact.findAll({
                    where: { isSuspicious: true }
                });

                for (const contact of suspiciousContacts) {
                    try {
                        await contact.destroy();
                        results.removed++;
                    } catch (error) {
                        results.errors.push(`Failed to remove contact ${contact.id}: ${error.message}`);
                    }
                }
            }

            // Remove invalid phone numbers if requested
            if (options.removeInvalidPhones) {
                const invalidContacts = await Contact.findAll({
                    where: { isValidPhone: false }
                });

                for (const contact of invalidContacts) {
                    try {
                        await contact.destroy();
                        results.removed++;
                    } catch (error) {
                        results.errors.push(`Failed to remove contact ${contact.id}: ${error.message}`);
                    }
                }
            }

            // Re-analyze all remaining contacts if requested
            if (options.reanalyzeAll) {
                const contacts = await Contact.findAll();
                
                for (const contact of contacts) {
                    try {
                        const analysis = await this.geminiService.analyzeContact(contact);
                        await contact.update({
                            qualityScore: analysis.qualityScore,
                            isValidPhone: analysis.isValidPhone,
                            isComplete: analysis.isComplete,
                            isSuspicious: analysis.isSuspicious,
                            aiAnalysis: analysis
                        });
                        results.updated++;
                    } catch (error) {
                        results.errors.push(`Failed to update contact ${contact.id}: ${error.message}`);
                    }
                }
            }

            logger.info('Database cleaning completed', results);
            return results;
        } catch (error) {
            logger.error('Error cleaning database', { error: error.message });
            throw error;
        }
    }

    /**
     * Distribute contacts among advisors
     */
    async distributeContacts() {
        try {
            const contacts = await Contact.findAll({
                where: { assignedAdvisorId: null }
            });
            
            const advisors = await Advisor.findAll({
                where: { isActive: true }
            });

            const distribution = await this.geminiService.suggestContactDistribution(contacts, advisors);
            
            // Apply the distribution
            const results = {
                assigned: 0,
                errors: []
            };

            for (const assignment of distribution.assignments) {
                try {
                    await Contact.update(
                        { assignedAdvisorId: assignment.advisorId },
                        { where: { id: assignment.contactId } }
                    );
                    
                    // Update advisor's current contact count
                    await Advisor.increment('currentContactCount', {
                        where: { id: assignment.advisorId }
                    });
                    
                    results.assigned++;
                } catch (error) {
                    results.errors.push(`Failed to assign contact ${assignment.contactId}: ${error.message}`);
                }
            }

            logger.info('Contact distribution completed', {
                assigned: results.assigned,
                unassigned: distribution.unassigned.length
            });

            return {
                ...results,
                distribution: distribution
            };
        } catch (error) {
            logger.error('Error distributing contacts', { error: error.message });
            throw error;
        }
    }

    /**
     * Get advisor management data
     */
    async getAdvisors() {
        try {
            const advisors = await Advisor.findAll({
                include: [{
                    model: Contact,
                    as: 'contacts',
                    attributes: ['id', 'name', 'status', 'qualityScore']
                }]
            });

            return advisors;
        } catch (error) {
            logger.error('Error fetching advisors', { error: error.message });
            throw error;
        }
    }

    /**
     * Create new advisor
     */
    async createAdvisor(advisorData) {
        try {
            const advisor = await Advisor.create(advisorData);
            logger.info('Advisor created', { advisorId: advisor.id });
            return advisor;
        } catch (error) {
            logger.error('Error creating advisor', { error: error.message });
            throw error;
        }
    }

    /**
     * Update advisor
     */
    async updateAdvisor(advisorId, updateData) {
        try {
            const advisor = await Advisor.findByPk(advisorId);
            if (!advisor) {
                throw new Error('Advisor not found');
            }

            await advisor.update(updateData);
            logger.info('Advisor updated', { advisorId: advisorId });
            return advisor;
        } catch (error) {
            logger.error('Error updating advisor', { error: error.message });
            throw error;
        }
    }

    /**
     * Get database statistics
     */
    async getStatistics() {
        try {
            const stats = {
                contacts: {
                    total: await Contact.count(),
                    valid: await Contact.count({ where: { isValidPhone: true } }),
                    suspicious: await Contact.count({ where: { isSuspicious: true } }),
                    complete: await Contact.count({ where: { isComplete: true } }),
                    assigned: await Contact.count({ where: { assignedAdvisorId: { [sequelize.Sequelize.Op.not]: null } } })
                },
                advisors: {
                    total: await Advisor.count(),
                    active: await Advisor.count({ where: { isActive: true } })
                },
                qualityDistribution: await Contact.findAll({
                    attributes: [
                        [sequelize.literal(`CASE 
                            WHEN qualityScore >= 80 THEN 'excellent'
                            WHEN qualityScore >= 60 THEN 'good'
                            WHEN qualityScore >= 40 THEN 'fair'
                            ELSE 'poor'
                        END`), 'quality'],
                        [sequelize.fn('COUNT', '*'), 'count']
                    ],
                    group: [sequelize.literal(`CASE 
                        WHEN qualityScore >= 80 THEN 'excellent'
                        WHEN qualityScore >= 60 THEN 'good'
                        WHEN qualityScore >= 40 THEN 'fair'
                        ELSE 'poor'
                    END`)],
                    raw: true
                })
            };

            return stats;
        } catch (error) {
            logger.error('Error fetching statistics', { error: error.message });
            throw error;
        }
    }
}

module.exports = DatabaseService;
