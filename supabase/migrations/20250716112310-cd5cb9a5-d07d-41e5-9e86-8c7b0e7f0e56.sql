-- Add foreign key constraints for data integrity
ALTER TABLE check_ins 
ADD CONSTRAINT fk_check_ins_member_id 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

ALTER TABLE transactions 
ADD CONSTRAINT fk_transactions_member_id 
FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- Create index for better performance on check-in queries
CREATE INDEX IF NOT EXISTS idx_transactions_member_ending_date 
ON transactions(member_id, ending_date DESC) WHERE status = 'complete';

CREATE INDEX IF NOT EXISTS idx_check_ins_member_time 
ON check_ins(member_id, check_in_time DESC);