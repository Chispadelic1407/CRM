const { GoogleGenerativeAI } = require('@google/generative-ai');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');
const validator = require('validator');
const logger = require('../utils/logger');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        if (!this.apiKey) {
            logger.warn('Gemini API key not found, running in demo mode');
            this.demoMode = true;
        } else {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
            this.demoMode = false;
            logger.info('Gemini AI service initialized successfully');
        }
    }

    /**
     * Analyze contact data quality and detect suspicious entries
     */
    async analyzeContact(contact) {
        try {
            const analysis = {
                qualityScore: 0,
                isValidPhone: false,
                isComplete: false,
                isSuspicious: false,
                issues: [],
                recommendations: []
            };

            // Phone number validation
            analysis.isValidPhone = this.validatePhoneNumber(contact.phone);
            if (!analysis.isValidPhone) {
                analysis.issues.push('Invalid phone number format');
                analysis.recommendations.push('Verify and correct phone number');
            } else {
                analysis.qualityScore += 30;
            }

            // Email validation
            if (contact.email) {
                if (validator.isEmail(contact.email)) {
                    analysis.qualityScore += 20;
                } else {
                    analysis.issues.push('Invalid email format');
                    analysis.recommendations.push('Verify and correct email address');
                }
            }

            // Name validation
            if (contact.name && contact.name.length >= 2) {
                analysis.qualityScore += 20;
                
                // Check for suspicious patterns in name
                if (this.isSuspiciousName(contact.name)) {
                    analysis.isSuspicious = true;
                    analysis.issues.push('Suspicious name pattern detected');
                }
            } else {
                analysis.issues.push('Name too short or missing');
                analysis.recommendations.push('Provide complete name');
            }

            // Completeness check
            const requiredFields = ['name', 'phone'];
            const optionalFields = ['email'];
            const completedRequired = requiredFields.filter(field => contact[field] && contact[field].trim()).length;
            const completedOptional = optionalFields.filter(field => contact[field] && contact[field].trim()).length;
            
            analysis.isComplete = completedRequired === requiredFields.length;
            if (analysis.isComplete) {
                analysis.qualityScore += 20;
            }

            // Bonus for optional fields
            analysis.qualityScore += (completedOptional / optionalFields.length) * 10;

            // AI-powered analysis (if not in demo mode)
            if (!this.demoMode) {
                const aiAnalysis = await this.performAIAnalysis(contact);
                analysis.aiInsights = aiAnalysis;
                
                // Adjust score based on AI insights
                if (aiAnalysis.suspiciousIndicators > 2) {
                    analysis.isSuspicious = true;
                    analysis.qualityScore -= 20;
                }
            }

            // Ensure score is within bounds
            analysis.qualityScore = Math.max(0, Math.min(100, analysis.qualityScore));

            return analysis;
        } catch (error) {
            logger.error('Error analyzing contact', { error: error.message, contact: contact.id });
            return {
                qualityScore: 0,
                isValidPhone: false,
                isComplete: false,
                isSuspicious: true,
                issues: ['Analysis failed'],
                recommendations: ['Manual review required']
            };
        }
    }

    /**
     * Perform AI-powered analysis using Gemini
     */
    async performAIAnalysis(contact) {
        if (this.demoMode) {
            return {
                suspiciousIndicators: Math.floor(Math.random() * 3),
                confidence: 0.8,
                insights: 'Demo mode - no actual AI analysis performed'
            };
        }

        try {
            const prompt = `
Analyze this contact data for quality and authenticity:
Name: ${contact.name}
Phone: ${contact.phone}
Email: ${contact.email || 'Not provided'}
Notes: ${contact.notes || 'None'}

Please evaluate:
1. Does this appear to be a real person?
2. Are there any red flags or suspicious patterns?
3. What is the likelihood this is a fake or test contact?
4. Any data quality issues?

Respond in JSON format with:
{
    "suspiciousIndicators": number (0-5),
    "confidence": number (0-1),
    "insights": "brief explanation",
    "redFlags": ["list", "of", "issues"],
    "suggestions": ["list", "of", "improvements"]
}
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return {
                suspiciousIndicators: 0,
                confidence: 0.5,
                insights: 'Could not parse AI response',
                redFlags: [],
                suggestions: []
            };
        } catch (error) {
            logger.error('Error in AI analysis', { error: error.message });
            return {
                suspiciousIndicators: 0,
                confidence: 0,
                insights: 'AI analysis failed',
                redFlags: ['Analysis error'],
                suggestions: ['Manual review recommended']
            };
        }
    }

    /**
     * Analyze entire contact database and suggest cleanup
     */
    async analyzeDatabaseHealth(contacts) {
        try {
            const analysis = {
                totalContacts: contacts.length,
                validContacts: 0,
                invalidContacts: 0,
                suspiciousContacts: 0,
                incompleteContacts: 0,
                duplicates: [],
                qualityDistribution: {
                    excellent: 0, // 80-100
                    good: 0,      // 60-79
                    fair: 0,      // 40-59
                    poor: 0       // 0-39
                },
                recommendations: []
            };

            // Find duplicates
            analysis.duplicates = this.findDuplicates(contacts);

            // Analyze each contact
            for (const contact of contacts) {
                const contactAnalysis = await this.analyzeContact(contact);
                
                if (contactAnalysis.isValidPhone && contactAnalysis.isComplete) {
                    analysis.validContacts++;
                } else {
                    analysis.invalidContacts++;
                }

                if (contactAnalysis.isSuspicious) {
                    analysis.suspiciousContacts++;
                }

                if (!contactAnalysis.isComplete) {
                    analysis.incompleteContacts++;
                }

                // Quality distribution
                const score = contactAnalysis.qualityScore;
                if (score >= 80) analysis.qualityDistribution.excellent++;
                else if (score >= 60) analysis.qualityDistribution.good++;
                else if (score >= 40) analysis.qualityDistribution.fair++;
                else analysis.qualityDistribution.poor++;
            }

            // Generate recommendations
            if (analysis.duplicates.length > 0) {
                analysis.recommendations.push(`Remove ${analysis.duplicates.length} duplicate contacts`);
            }
            if (analysis.suspiciousContacts > 0) {
                analysis.recommendations.push(`Review ${analysis.suspiciousContacts} suspicious contacts`);
            }
            if (analysis.incompleteContacts > 0) {
                analysis.recommendations.push(`Complete data for ${analysis.incompleteContacts} contacts`);
            }
            if (analysis.qualityDistribution.poor > 0) {
                analysis.recommendations.push(`Improve data quality for ${analysis.qualityDistribution.poor} poor-quality contacts`);
            }

            return analysis;
        } catch (error) {
            logger.error('Error analyzing database health', { error: error.message });
            throw error;
        }
    }

    /**
     * Suggest optimal distribution of contacts among advisors
     */
    async suggestContactDistribution(contacts, advisors) {
        try {
            const distribution = {
                assignments: [],
                unassigned: [],
                recommendations: []
            };

            // Filter active advisors
            const activeAdvisors = advisors.filter(advisor => advisor.isActive);
            
            if (activeAdvisors.length === 0) {
                distribution.unassigned = contacts;
                distribution.recommendations.push('No active advisors available');
                return distribution;
            }

            // Sort contacts by priority and quality
            const sortedContacts = contacts.sort((a, b) => {
                const priorityWeight = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
                const aPriority = priorityWeight[a.priority] || 2;
                const bPriority = priorityWeight[b.priority] || 2;
                
                if (aPriority !== bPriority) return bPriority - aPriority;
                return (b.qualityScore || 0) - (a.qualityScore || 0);
            });

            // Sort advisors by performance and availability
            const sortedAdvisors = activeAdvisors.sort((a, b) => {
                const aCapacity = (a.maxContacts - a.currentContactCount) / a.maxContacts;
                const bCapacity = (b.maxContacts - b.currentContactCount) / b.maxContacts;
                
                if (Math.abs(aCapacity - bCapacity) > 0.1) {
                    return bCapacity - aCapacity; // Higher capacity first
                }
                
                return (b.performanceScore || 0) - (a.performanceScore || 0);
            });

            // Distribute contacts
            let advisorIndex = 0;
            for (const contact of sortedContacts) {
                let assigned = false;
                
                // Try to assign to an advisor with capacity
                for (let i = 0; i < sortedAdvisors.length; i++) {
                    const advisor = sortedAdvisors[(advisorIndex + i) % sortedAdvisors.length];
                    
                    if (advisor.currentContactCount < advisor.maxContacts) {
                        distribution.assignments.push({
                            contactId: contact.id,
                            advisorId: advisor.id,
                            reason: this.getAssignmentReason(contact, advisor)
                        });
                        
                        advisor.currentContactCount++;
                        assigned = true;
                        advisorIndex = (advisorIndex + 1) % sortedAdvisors.length;
                        break;
                    }
                }
                
                if (!assigned) {
                    distribution.unassigned.push(contact);
                }
            }

            // Generate recommendations
            if (distribution.unassigned.length > 0) {
                distribution.recommendations.push(`${distribution.unassigned.length} contacts could not be assigned - consider increasing advisor capacity`);
            }

            const avgLoad = distribution.assignments.length / activeAdvisors.length;
            const overloadedAdvisors = activeAdvisors.filter(a => a.currentContactCount > avgLoad * 1.2);
            if (overloadedAdvisors.length > 0) {
                distribution.recommendations.push(`${overloadedAdvisors.length} advisors may be overloaded`);
            }

            return distribution;
        } catch (error) {
            logger.error('Error suggesting contact distribution', { error: error.message });
            throw error;
        }
    }

    /**
     * Validate phone number using libphonenumber-js
     */
    validatePhoneNumber(phone) {
        try {
            if (!phone) return false;
            
            // Clean the phone number
            const cleaned = phone.replace(/[^\d+]/g, '');
            
            // Basic validation
            if (cleaned.length < 10) return false;
            
            // Use libphonenumber-js for validation
            return isValidPhoneNumber(cleaned, 'MX'); // Default to Mexico
        } catch (error) {
            return false;
        }
    }

    /**
     * Check for suspicious name patterns
     */
    isSuspiciousName(name) {
        const suspiciousPatterns = [
            /^test/i,
            /^demo/i,
            /^fake/i,
            /^sample/i,
            /^\d+$/,
            /^[a-z]+$/,
            /^[A-Z]+$/,
            /(.){3,}/, // Repeated characters
            /^.{1,2}$/   // Too short
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(name));
    }

    /**
     * Find duplicate contacts
     */
    findDuplicates(contacts) {
        const duplicates = [];
        const phoneMap = new Map();
        const emailMap = new Map();
        
        contacts.forEach(contact => {
            // Check phone duplicates
            if (contact.phone) {
                const cleanPhone = contact.phone.replace(/[^\d]/g, '');
                if (phoneMap.has(cleanPhone)) {
                    duplicates.push({
                        type: 'phone',
                        contacts: [phoneMap.get(cleanPhone), contact.id],
                        value: cleanPhone
                    });
                } else {
                    phoneMap.set(cleanPhone, contact.id);
                }
            }
            
            // Check email duplicates
            if (contact.email) {
                const cleanEmail = contact.email.toLowerCase();
                if (emailMap.has(cleanEmail)) {
                    duplicates.push({
                        type: 'email',
                        contacts: [emailMap.get(cleanEmail), contact.id],
                        value: cleanEmail
                    });
                } else {
                    emailMap.set(cleanEmail, contact.id);
                }
            }
        });
        
        return duplicates;
    }

    /**
     * Get assignment reason for contact-advisor pairing
     */
    getAssignmentReason(contact, advisor) {
        const reasons = [];
        
        if (advisor.performanceScore > 80) {
            reasons.push('High-performing advisor');
        }
        
        if (contact.priority === 'Urgent' || contact.priority === 'High') {
            reasons.push('High priority contact');
        }
        
        if (contact.qualityScore > 80) {
            reasons.push('High quality lead');
        }
        
        const capacity = (advisor.maxContacts - advisor.currentContactCount) / advisor.maxContacts;
        if (capacity > 0.5) {
            reasons.push('Available capacity');
        }
        
        return reasons.length > 0 ? reasons.join(', ') : 'Round-robin assignment';
    }
}

module.exports = GeminiService;
