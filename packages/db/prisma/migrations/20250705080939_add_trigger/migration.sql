-- AlterEnum
ALTER TYPE "p2p_transaction_status" ADD VALUE 'Pending';
-- Create a notification function
CREATE OR REPLACE FUNCTION notify_user_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify the channel 'outbox_new_message' with the new ID
    PERFORM pg_notify(
        'outbox_new_message',
        row_to_json(NEW)::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists (for migration reruns)
DROP TRIGGER IF EXISTS outbox_insert_trigger ON transaction_outbox;

-- Create the trigger
CREATE TRIGGER outbox_insert_trigger
AFTER INSERT ON transaction_outbox
FOR EACH ROW
EXECUTE FUNCTION notify_user_insert();