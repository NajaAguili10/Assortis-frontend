/**
 * Email Service - Handles sending confirmation emails
 * In production, this would integrate with a backend email service like SendGrid, AWS SES, etc.
 */

export interface EmailData {
  to: string;
  subject: string;
  firstName?: string;
  lastName?: string;
  accountType: 'organization' | 'expert';
  planType: 'professional' | 'enterprise';
  orgName?: string;
  amount?: number;
  discountPercent?: number;
}

/**
 * Send confirmation email after successful payment
 */
export async function sendConfirmationEmail(data: EmailData): Promise<boolean> {
  try {
    // Simulate API call to send email
    console.log('📧 Sending confirmation email to:', data.to);
    console.log('Email data:', {
      accountType: data.accountType,
      planType: data.planType,
      orgName: data.orgName,
      amount: data.amount,
    });

    // In production, this would call your backend API endpoint
    // Example:
    // const response = await fetch('/api/send-confirmation-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.ok;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For development: Log email content that would be sent
    const emailContent = generateEmailContent(data);
    console.log('Email content preview:', emailContent);

    return true;
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return false;
  }
}

/**
 * Generate email content based on user data and language
 */
function generateEmailContent(data: EmailData): string {
  const { firstName, accountType, planType, orgName, amount, discountPercent } = data;
  
  // In production, you would use proper email templates
  // This is just a preview of what the email would contain
  return `
    Welcome to Assortis!
    
    Dear ${firstName || 'User'},
    
    Thank you for joining Assortis - the international cooperation platform.
    
    Account Details:
    - Account Type: ${accountType === 'organization' ? 'Organization' : 'Expert/Individual'}
    ${orgName ? `- Organization: ${orgName}` : ''}
    - Subscription Plan: ${planType === 'professional' ? 'Professional' : 'Enterprise'}
    ${amount ? `- Amount Paid: $${amount}` : ''}
    ${discountPercent ? `- Discount Applied: ${discountPercent}%` : ''}
    
    Next Steps:
    1. Verify your email address by clicking the link below
    2. Complete your profile information
    3. Start exploring opportunities on Assortis
    
    [Verify Email Button]
    
    If you have any questions, please contact our support team.
    
    Best regards,
    The Assortis Team
  `;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  try {
    console.log('📧 Sending welcome email to:', email);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`Welcome email sent successfully to ${firstName} at ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  amount: number,
  planName: string,
  transactionId: string
): Promise<boolean> {
  try {
    console.log('📧 Sending payment confirmation to:', email);
    console.log('Payment details:', {
      amount: `$${amount}`,
      plan: planName,
      transactionId,
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    return false;
  }
}
