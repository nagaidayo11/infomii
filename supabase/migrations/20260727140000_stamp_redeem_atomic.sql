-- Atomic reward redemption to prevent double-execution under concurrent requests.
-- Locks the card row, recomputes active count, inserts redemption + carryover in one tx.

create or replace function public.stamp_redeem_atomic(
  p_card_id uuid,
  p_tier integer,
  p_confirmed_by uuid
) returns integer
language plpgsql
as $$
declare
  v_program uuid;
  v_hotel uuid;
  v_last_redeem timestamptz;
  v_count integer;
  v_remainder integer;
  v_redeem_at timestamptz;
begin
  select program_id, hotel_id
    into v_program, v_hotel
  from public.stamp_cards
  where id = p_card_id and status = 'active'
  for update;

  if v_program is null then
    raise exception 'CARD_NOT_FOUND';
  end if;

  select max(created_at) into v_last_redeem
  from public.stamp_redemptions
  where card_id = p_card_id;

  select count(*) into v_count
  from public.stamp_events
  where card_id = p_card_id
    and (v_last_redeem is null or created_at > v_last_redeem);

  if v_count < p_tier then
    raise exception 'INSUFFICIENT';
  end if;

  v_redeem_at := clock_timestamp();

  insert into public.stamp_redemptions
    (card_id, program_id, hotel_id, stamps_at_redeem, confirmed_by, created_at)
  values
    (p_card_id, v_program, v_hotel, p_tier, p_confirmed_by, v_redeem_at);

  v_remainder := v_count - p_tier;

  if v_remainder > 0 then
    insert into public.stamp_events
      (card_id, program_id, hotel_id, source, created_by, created_at)
    select
      p_card_id, v_program, v_hotel, 'carryover', null,
      v_redeem_at + interval '20 milliseconds'
    from generate_series(1, v_remainder);
  end if;

  update public.stamp_cards
  set pending_redeem = false,
      pending_redeem_tier = null,
      updated_at = now()
  where id = p_card_id;

  return v_remainder;
end;
$$;
