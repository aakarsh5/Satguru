update products
set payload = jsonb_set(
  payload,
  '{variants}',
  coalesce(
    (
      select jsonb_agg(
        variant - 'price' - 'compareAtPrice' - 'currency'
        order by ordinality
      )
      from jsonb_array_elements(payload->'variants') with ordinality as variants(variant, ordinality)
    ),
    '[]'::jsonb
  )
)
where payload ? 'variants';
