export type RazorpayDisputeEventType =
  | 'payment.dispute.created'
  | 'payment.dispute.won'
  | 'payment.dispute.closed'
  | 'payment.dispute.under_review'
  | 'payment.dispute.action_required';
