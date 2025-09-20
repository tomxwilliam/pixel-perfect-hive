UPDATE hosting_packages SET 
  stripe_price_id = CASE 
    WHEN package_name = 'Starter Plan' THEN 'price_live_starter_xxx'
    WHEN package_name = 'Pro Plan' THEN 'price_live_pro_xxx' 
    WHEN package_name = 'Elite Plan' THEN 'price_live_elite_xxx'
    ELSE stripe_price_id
  END,
  whm_package_name = CASE
    WHEN package_name = 'Starter Plan' THEN 'STARTER_PKG'
    WHEN package_name = 'Pro Plan' THEN 'PRO_PKG'
    WHEN package_name = 'Elite Plan' THEN 'ELITE_PKG'
    ELSE whm_package_name
  END
WHERE package_name IN ('Starter Plan', 'Pro Plan', 'Elite Plan');