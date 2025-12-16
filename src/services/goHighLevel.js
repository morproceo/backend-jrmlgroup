/**
 * GoHighLevel CRM Integration Service
 *
 * Field keys mapped to your GHL custom fields:
 * - contact.application_id
 * - contact.application_status
 * - contact.position_type
 * - contact.submitted_date
 * - contact.date_of_birth (STANDARD_FIELD)
 * - contact.earliest_start_date
 * - contact.street_address
 * - contact.city (STANDARD_FIELD)
 * - contact.state (STANDARD_FIELD)
 * - contact.zip_code
 * - contact.cdl_number
 * - contact.cdl_state
 * - contact.cdl_class
 * - contact.license_expiration
 * - contact.endorsements
 * - contact.has_twic_card
 * - contact.twic_expiration
 * - contact.years_experience
 * - contact.has_accidents_3yr
 * - contact.accident_details
 * - contact.has_moving_violations
 * - contact.violation_details
 * - contact.has_duidwi
 * - contact.employer_1_name
 * - contact.employer_1_phone
 * - contact.employer_1_start_date
 * - contact.employer_1_end_date
 * - contact.employer_1_reason_leaving
 * - contact.employer_2_name
 * - contact.employer_2_phone
 * - contact.employer_2_start_date
 * - contact.employer_2_end_date
 * - contact.employer_2_reason_leaving
 * - contact.has_own_truck
 * - contact.truck_year
 * - contact.truck_make
 * - contact.truck_model
 * - contact.truck_vin
 * - contact.has_trailer
 * - contact.trailer_type
 * - contact.trailer_length
 * - contact.reference_1_name
 * - contact.reference_1_phone
 * - contact.reference_1_relationship
 * - contact.reference_2_name
 * - contact.reference_2_phone
 * - contact.reference_2_relationship
 * - contact.electronic_signature
 */

const axios = require('axios');

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

// Hardcode the webhook URL to ensure it works
const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MdODoEYOK4P9IMRz4yRS/webhook-trigger/0f448356-fa87-4d61-a607-348ae89556d4';

/**
 * Send application data to GoHighLevel via webhook
 * This is the simplest integration method
 */
async function sendToWebhook(application) {
  console.log('=== SENDING TO GOHIGHLEVEL ===');
  console.log('Webhook URL:', GHL_WEBHOOK_URL);

  try {
    const payload = buildWebhookPayload(application);

    console.log('Payload being sent:');
    console.log(JSON.stringify(payload, null, 2));

    const response = await axios.post(GHL_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('GoHighLevel webhook response:', response.data);
    console.log('=== WEBHOOK SENT SUCCESSFULLY ===');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('=== WEBHOOK ERROR ===');
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Build webhook payload matching your GHL custom field keys
 */
function buildWebhookPayload(application) {
  // Format phone to E.164 format for GHL (strip formatting, add +1)
  const formatPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10 ? `+1${digits}` : `+${digits}`;
  };

  return {
    // Standard contact fields
    firstName: application.firstName,
    lastName: application.lastName,
    email: application.email,
    phone: formatPhone(application.phone),

    // Application info
    application_id: application.applicationId,
    application_status: application.status || 'Pending',
    position_type: application.position === 'OO' ? 'Owner Operator' : 'Lease Operator',
    submitted_date: application.submittedAt,

    // Personal info (some are standard fields in GHL)
    date_of_birth: application.dateOfBirth,
    earliest_start_date: application.startDate,
    street_address: application.streetAddress,
    city: application.city,
    state: application.state,
    zip_code: application.zipCode,

    // CDL info
    cdl_number: application.cdlNumber,
    cdl_state: application.cdlState,
    cdl_class: application.cdlClass,
    license_expiration: application.licenseExpiration,
    endorsements: Array.isArray(application.endorsements)
      ? application.endorsements.join(', ')
      : application.endorsements,
    has_twic_card: application.hasTWIC ? 'Yes' : 'No',
    twic_expiration: application.twicExpiration,

    // Experience & Safety
    years_experience: application.yearsExperience,
    has_accidents_3yr: application.hasAccidents ? 'Yes' : 'No',
    accident_details: application.accidentDetails,
    has_moving_violations: application.hasViolations ? 'Yes' : 'No',
    violation_details: application.violationDetails,
    has_duidwi: application.hasDUI ? 'Yes' : 'No',

    // Employment 1
    employer_1_name: application.employer1Name,
    employer_1_phone: application.employer1Phone,
    employer_1_start_date: application.employer1StartDate,
    employer_1_end_date: application.employer1EndDate,
    employer_1_reason_leaving: application.employer1ReasonLeaving,

    // Employment 2
    employer_2_name: application.employer2Name,
    employer_2_phone: application.employer2Phone,
    employer_2_start_date: application.employer2StartDate,
    employer_2_end_date: application.employer2EndDate,
    employer_2_reason_leaving: application.employer2ReasonLeaving,

    // Equipment
    has_own_truck: application.hasOwnTruck ? 'Yes' : 'No',
    truck_year: application.truckYear,
    truck_make: application.truckMake,
    truck_model: application.truckModel,
    truck_vin: application.truckVIN,
    has_trailer: application.hasTrailer ? 'Yes' : 'No',
    trailer_type: application.trailerType,
    trailer_length: application.trailerLength,

    // References
    reference_1_name: application.ref1Name,
    reference_1_phone: application.ref1Phone,
    reference_1_relationship: application.ref1Relationship,
    reference_2_name: application.ref2Name,
    reference_2_phone: application.ref2Phone,
    reference_2_relationship: application.ref2Relationship,

    // Signature
    electronic_signature: application.electronicSignature,

    // Tags for workflow triggers
    tags: [
      'Driver Application',
      application.position === 'OO' ? 'Owner Operator' : 'Lease Operator'
    ].join(',')
  };
}

/**
 * Create or update a contact in GoHighLevel via API
 */
async function createOrUpdateContact(application) {
  // First try webhook (simpler)
  if (GHL_WEBHOOK_URL) {
    return sendToWebhook(application);
  }

  // Fall back to API if configured
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.log('GoHighLevel not configured, skipping sync');
    return { success: false, message: 'API not configured' };
  }

  try {
    const contactData = {
      locationId: GHL_LOCATION_ID,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      source: 'JRML Website Application',
      tags: [
        'Driver Application',
        application.position === 'OO' ? 'Owner Operator' : 'Lease Operator',
        `Status: ${application.status || 'Pending'}`
      ],
      customFields: buildCustomFields(application)
    };

    const existingContact = await findContactByEmail(application.email);

    let response;
    if (existingContact) {
      response = await axios.put(
        `${GHL_API_BASE}/contacts/${existingContact.id}`,
        contactData,
        {
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          }
        }
      );
    } else {
      response = await axios.post(
        `${GHL_API_BASE}/contacts/`,
        contactData,
        {
          headers: {
            'Authorization': `Bearer ${GHL_API_KEY}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28'
          }
        }
      );
    }

    return {
      success: true,
      contactId: response.data.contact?.id || existingContact?.id
    };
  } catch (error) {
    console.error('GoHighLevel API error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Find a contact by email
 */
async function findContactByEmail(email) {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) return null;

  try {
    const response = await axios.get(
      `${GHL_API_BASE}/contacts/search/duplicate`,
      {
        params: {
          locationId: GHL_LOCATION_ID,
          email: email
        },
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28'
        }
      }
    );

    return response.data.contact || null;
  } catch (error) {
    console.error('Error finding contact:', error.message);
    return null;
  }
}

/**
 * Update contact status in GoHighLevel
 */
async function updateContactStatus(contactId, status) {
  if (!GHL_API_KEY || !contactId) return;

  try {
    const statusMap = {
      'pending': 'Pending',
      'review': 'Under Review',
      'background': 'Background Check',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };

    await axios.put(
      `${GHL_API_BASE}/contacts/${contactId}`,
      {
        customFields: [
          {
            key: 'application_status',
            value: statusMap[status] || status
          }
        ],
        tags: [`Status: ${statusMap[status] || status}`]
      },
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Error updating contact status:', error.message);
    throw error;
  }
}

/**
 * Build custom fields array for GoHighLevel API
 * Keys match your GHL custom field configuration
 */
function buildCustomFields(application) {
  const fields = [];

  const addField = (key, value) => {
    if (value !== null && value !== undefined && value !== '') {
      fields.push({ key, value: String(value) });
    }
  };

  // Application info
  addField('application_id', application.applicationId);
  addField('position_type', application.position === 'OO' ? 'Owner Operator' : 'Lease Operator');
  addField('application_status', application.status || 'Pending');
  addField('submitted_date', application.submittedAt);

  // Personal info
  addField('earliest_start_date', application.startDate);
  addField('street_address', application.streetAddress);
  addField('zip_code', application.zipCode);

  // CDL info
  addField('cdl_number', application.cdlNumber);
  addField('cdl_state', application.cdlState);
  addField('cdl_class', application.cdlClass);
  addField('license_expiration', application.licenseExpiration);
  if (application.endorsements) {
    addField('endorsements', Array.isArray(application.endorsements)
      ? application.endorsements.join(', ')
      : application.endorsements);
  }
  addField('has_twic_card', application.hasTWIC ? 'Yes' : 'No');
  addField('twic_expiration', application.twicExpiration);

  // Driving record
  addField('years_experience', application.yearsExperience);
  addField('has_accidents_3yr', application.hasAccidents ? 'Yes' : 'No');
  addField('accident_details', application.accidentDetails);
  addField('has_moving_violations', application.hasViolations ? 'Yes' : 'No');
  addField('violation_details', application.violationDetails);
  addField('has_duidwi', application.hasDUI ? 'Yes' : 'No');

  // Employment history
  addField('employer_1_name', application.employer1Name);
  addField('employer_1_phone', application.employer1Phone);
  addField('employer_1_start_date', application.employer1StartDate);
  addField('employer_1_end_date', application.employer1EndDate);
  addField('employer_1_reason_leaving', application.employer1ReasonLeaving);

  addField('employer_2_name', application.employer2Name);
  addField('employer_2_phone', application.employer2Phone);
  addField('employer_2_start_date', application.employer2StartDate);
  addField('employer_2_end_date', application.employer2EndDate);
  addField('employer_2_reason_leaving', application.employer2ReasonLeaving);

  // Equipment
  addField('has_own_truck', application.hasOwnTruck ? 'Yes' : 'No');
  addField('truck_year', application.truckYear);
  addField('truck_make', application.truckMake);
  addField('truck_model', application.truckModel);
  addField('truck_vin', application.truckVIN);
  addField('has_trailer', application.hasTrailer ? 'Yes' : 'No');
  addField('trailer_type', application.trailerType);
  addField('trailer_length', application.trailerLength);

  // References
  addField('reference_1_name', application.ref1Name);
  addField('reference_1_phone', application.ref1Phone);
  addField('reference_1_relationship', application.ref1Relationship);
  addField('reference_2_name', application.ref2Name);
  addField('reference_2_phone', application.ref2Phone);
  addField('reference_2_relationship', application.ref2Relationship);

  // Signature
  addField('electronic_signature', application.electronicSignature);

  return fields;
}

/**
 * Trigger a workflow in GoHighLevel
 */
async function triggerWorkflow(contactId, workflowId) {
  if (!GHL_API_KEY || !contactId || !workflowId) return;

  try {
    await axios.post(
      `${GHL_API_BASE}/contacts/${contactId}/workflow/${workflowId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28'
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Error triggering workflow:', error.message);
    throw error;
  }
}

module.exports = {
  createOrUpdateContact,
  sendToWebhook,
  findContactByEmail,
  updateContactStatus,
  triggerWorkflow
};
