
-- Enhanced stored procedures with security and error handling improvements

-- 2.2.1 Overview - Enhanced with explicit search_path and error handling
CREATE OR REPLACE FUNCTION sp_get_client_overview_v1(
    p_client_id UUID,
    p_tenant_id UUID
) RETURNS TABLE(
    client_id UUID,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    date_of_birth DATE,
    emergency_contact TEXT,
    risk_score INTEGER,
    risk_assessment_date TIMESTAMP WITH TIME ZONE,
    risk_notes TEXT,
    referrals JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_referrals JSONB;
    v_client_exists BOOLEAN := FALSE;
BEGIN
    -- Validate tenant access
    IF p_tenant_id <> (auth.jwt() ->> 'tenant_id')::uuid THEN
        RAISE EXCEPTION 'Access denied: tenant mismatch' USING ERRCODE = '42501';
    END IF;

    -- Validate input parameters
    IF p_client_id IS NULL OR p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Client ID and Tenant ID cannot be null' USING ERRCODE = '22004';
    END IF;

    BEGIN
        -- Check if client exists for this tenant
        SELECT EXISTS(
            SELECT 1 FROM tbl_clients 
            WHERE id = p_client_id AND tenant_id = p_tenant_id
        ) INTO v_client_exists;

        IF NOT v_client_exists THEN
            RAISE EXCEPTION 'Client not found or access denied' USING ERRCODE = '02000';
        END IF;

        -- Get referrals for this client using optimized query
        SELECT COALESCE(
            json_agg(
                json_build_object(
                    'id', r.id,
                    'type', r.referral_type,
                    'practitioner_name', r.referring_practitioner_name,
                    'practitioner_email', r.referring_practitioner_email,
                    'practitioner_phone', r.referring_practitioner_phone,
                    'practice_name', r.referring_practice_name,
                    'reason', r.referral_reason,
                    'date', r.referral_date,
                    'status', r.status
                ) ORDER BY r.referral_date DESC
            ), '[]'::jsonb
        ) INTO v_referrals
        FROM tbl_referrals r
        WHERE r.tenant_id = p_tenant_id AND r.client_id = p_client_id;

        -- Return client overview with referrals
        RETURN QUERY
        SELECT 
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address,
            c.date_of_birth,
            c.emergency_contact,
            c.risk_score,
            c.risk_assessment_date,
            c.risk_notes,
            v_referrals
        FROM tbl_clients c
        WHERE c.id = p_client_id AND c.tenant_id = p_tenant_id;

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE EXCEPTION 'Client not found' USING ERRCODE = '02000';
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error retrieving client overview: %', SQLERRM USING ERRCODE = 'P0001';
    END;
END;
$$;

-- Enhanced risk score update with better error handling
CREATE OR REPLACE FUNCTION sp_update_client_risk_score_v1(
    p_client_id UUID,
    p_tenant_id UUID,
    p_risk_score INTEGER,
    p_risk_notes TEXT,
    p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_old_risk_score INTEGER;
    v_client_exists BOOLEAN := FALSE;
BEGIN
    -- Input validation
    IF p_client_id IS NULL OR p_tenant_id IS NULL OR p_user_id IS NULL THEN
        RAISE EXCEPTION 'Required parameters cannot be null' USING ERRCODE = '22004';
    END IF;

    -- Validate tenant access
    IF p_tenant_id <> (auth.jwt() ->> 'tenant_id')::uuid THEN
        RAISE EXCEPTION 'Access denied: tenant mismatch' USING ERRCODE = '42501';
    END IF;

    -- Validate risk score range
    IF p_risk_score < 0 OR p_risk_score > 10 THEN
        RAISE EXCEPTION 'Risk score must be between 0 and 10' USING ERRCODE = '23514';
    END IF;

    BEGIN
        -- Get current risk score and verify client exists
        SELECT risk_score INTO v_old_risk_score
        FROM tbl_clients
        WHERE id = p_client_id AND tenant_id = p_tenant_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Client not found or access denied' USING ERRCODE = '02000';
        END IF;

        -- Update client risk score
        UPDATE tbl_clients
        SET 
            risk_score = p_risk_score,
            risk_assessment_date = NOW(),
            risk_notes = p_risk_notes,
            updated_by = p_user_id,
            updated_at = NOW()
        WHERE id = p_client_id AND tenant_id = p_tenant_id;

        -- Audit log with old and new values
        INSERT INTO tbl_audit_logs (
            entity, entity_id, action, actor_id, tenant_id, details
        ) VALUES (
            'clients', p_client_id::text, 'UPDATE_RISK_SCORE', p_user_id, p_tenant_id,
            jsonb_build_object(
                'old_risk_score', v_old_risk_score,
                'new_risk_score', p_risk_score,
                'risk_notes', p_risk_notes,
                'assessment_date', NOW()
            )
        );

    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error updating risk score: %', SQLERRM USING ERRCODE = 'P0001';
    END;
END;
$$;

-- Enhanced goals retrieval with better performance
CREATE OR REPLACE FUNCTION sp_get_client_goals_with_guidance_v1(
    p_client_id UUID,
    p_tenant_id UUID
) RETURNS TABLE(
    emotional_mental TEXT,
    physical TEXT,
    social_relational TEXT,
    spiritual TEXT,
    environmental TEXT,
    intellectual_occupational TEXT,
    financial TEXT,
    guidance JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_guidance JSONB;
    v_client_exists BOOLEAN := FALSE;
BEGIN
    -- Input validation
    IF p_client_id IS NULL OR p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Client ID and Tenant ID cannot be null' USING ERRCODE = '22004';
    END IF;

    -- Validate tenant access
    IF p_tenant_id <> (auth.jwt() ->> 'tenant_id')::uuid THEN
        RAISE EXCEPTION 'Access denied: tenant mismatch' USING ERRCODE = '42501';
    END IF;

    BEGIN
        -- Verify client exists
        SELECT EXISTS(
            SELECT 1 FROM tbl_clients 
            WHERE id = p_client_id AND tenant_id = p_tenant_id
        ) INTO v_client_exists;

        IF NOT v_client_exists THEN
            RAISE EXCEPTION 'Client not found or access denied' USING ERRCODE = '02000';
        END IF;

        -- Get tenant-specific goal guidance with optimized query
        SELECT COALESCE(
            json_object_agg(gg.goal_category, gg.guidance_text), 
            '{}'::jsonb
        ) INTO v_guidance
        FROM tbl_goal_guidance gg
        WHERE gg.tenant_id = p_tenant_id AND gg.is_active = true;

        -- Return goals with guidance
        RETURN QUERY
        SELECT 
            COALESCE(cg.emotional_mental, ''::text),
            COALESCE(cg.physical, ''::text),
            COALESCE(cg.social_relational, ''::text),
            COALESCE(cg.spiritual, ''::text),
            COALESCE(cg.environmental, ''::text),
            COALESCE(cg.intellectual_occupational, ''::text),
            COALESCE(cg.financial, ''::text),
            v_guidance
        FROM tbl_client_goals cg
        WHERE cg.client_id = p_client_id AND cg.tenant_id = p_tenant_id
        UNION ALL
        SELECT 
            ''::text, ''::text, ''::text, ''::text, ''::text, ''::text, ''::text,
            v_guidance
        WHERE NOT EXISTS (
            SELECT 1 FROM tbl_client_goals 
            WHERE client_id = p_client_id AND tenant_id = p_tenant_id
        );

    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error retrieving client goals: %', SQLERRM USING ERRCODE = 'P0001';
    END;
END;
$$;

-- Enhanced session history with better performance and error handling
CREATE OR REPLACE FUNCTION sp_get_client_session_history_v1(
    p_client_id UUID,
    p_tenant_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
) RETURNS TABLE(
    session_id UUID,
    session_date TIMESTAMP WITH TIME ZONE,
    session_type TEXT,
    duration_minutes INTEGER,
    status TEXT,
    summary_excerpt TEXT,
    therapist_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_client_exists BOOLEAN := FALSE;
BEGIN
    -- Input validation
    IF p_client_id IS NULL OR p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Client ID and Tenant ID cannot be null' USING ERRCODE = '22004';
    END IF;

    IF p_limit < 1 OR p_limit > 1000 THEN
        RAISE EXCEPTION 'Limit must be between 1 and 1000' USING ERRCODE = '22003';
    END IF;

    IF p_offset < 0 THEN
        RAISE EXCEPTION 'Offset cannot be negative' USING ERRCODE = '22003';
    END IF;

    -- Validate tenant access
    IF p_tenant_id <> (auth.jwt() ->> 'tenant_id')::uuid THEN
        RAISE EXCEPTION 'Access denied: tenant mismatch' USING ERRCODE = '42501';
    END IF;

    BEGIN
        -- Verify client exists
        SELECT EXISTS(
            SELECT 1 FROM tbl_clients 
            WHERE id = p_client_id AND tenant_id = p_tenant_id
        ) INTO v_client_exists;

        IF NOT v_client_exists THEN
            RAISE EXCEPTION 'Client not found or access denied' USING ERRCODE = '02000';
        END IF;

        -- Return session history with optimized query using composite index
        RETURN QUERY
        SELECT 
            s.id,
            s.session_date,
            s.session_type,
            s.duration_minutes,
            s.status,
            s.summary_excerpt,
            COALESCE(t.full_name, 'Unknown') as therapist_name
        FROM tbl_sessions s
        LEFT JOIN tbl_therapists t ON t.id = s.therapist_id
        WHERE s.tenant_id = p_tenant_id AND s.client_id = p_client_id
        ORDER BY s.session_date DESC
        LIMIT p_limit OFFSET p_offset;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error retrieving session history: %', SQLERRM USING ERRCODE = 'P0001';
    END;
END;
$$;

-- Enhanced invoice generation with lock-based numbering
CREATE OR REPLACE FUNCTION sp_generate_superbill_v1(
    p_client_id UUID,
    p_tenant_id UUID,
    p_services JSONB,
    p_amount DECIMAL(10,2),
    p_description TEXT,
    p_user_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_invoice_id UUID;
    v_invoice_number TEXT;
    v_current_number INTEGER;
    v_client_exists BOOLEAN := FALSE;
BEGIN
    -- Input validation
    IF p_client_id IS NULL OR p_tenant_id IS NULL OR p_user_id IS NULL THEN
        RAISE EXCEPTION 'Required parameters cannot be null' USING ERRCODE = '22004';
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than zero' USING ERRCODE = '23514';
    END IF;

    -- Validate tenant access
    IF p_tenant_id <> (auth.jwt() ->> 'tenant_id')::uuid THEN
        RAISE EXCEPTION 'Access denied: tenant mismatch' USING ERRCODE = '42501';
    END IF;

    BEGIN
        -- Verify client exists
        SELECT EXISTS(
            SELECT 1 FROM tbl_clients 
            WHERE id = p_client_id AND tenant_id = p_tenant_id
        ) INTO v_client_exists;

        IF NOT v_client_exists THEN
            RAISE EXCEPTION 'Client not found or access denied' USING ERRCODE = '02000';
        END IF;

        -- Lock-based invoice numbering to prevent gaps in critical scenarios
        INSERT INTO tbl_invoice_counters (tenant_id, current_number)
        VALUES (p_tenant_id, 1000)
        ON CONFLICT (tenant_id) DO NOTHING;

        -- Get and increment invoice number atomically
        UPDATE tbl_invoice_counters 
        SET current_number = current_number + 1
        WHERE tenant_id = p_tenant_id
        RETURNING current_number INTO v_current_number;

        -- Generate invoice number
        v_invoice_number := format('INV-%s-%s', 
            TO_CHAR(NOW(), 'YYYYMM'), 
            LPAD(v_current_number::text, 4, '0')
        );

        -- Create invoice
        INSERT INTO tbl_invoices (
            client_id, tenant_id, invoice_number, amount, description,
            services_provided, issue_date, due_date, created_by, updated_by
        ) VALUES (
            p_client_id, p_tenant_id, v_invoice_number, p_amount, p_description,
            COALESCE(p_services, '{}'::jsonb), CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
            p_user_id, p_user_id
        ) RETURNING id INTO v_invoice_id;

        -- Audit log
        INSERT INTO tbl_audit_logs (
            entity, entity_id, action, actor_id, tenant_id, details
        ) VALUES (
            'invoices', v_invoice_id::text, 'CREATE_INVOICE', p_user_id, p_tenant_id,
            jsonb_build_object(
                'invoice_number', v_invoice_number,
                'amount', p_amount,
                'client_id', p_client_id
            )
        );

        RETURN v_invoice_id;

    EXCEPTION
        WHEN unique_violation THEN
            RAISE EXCEPTION 'Invoice number conflict, please retry' USING ERRCODE = '23505';
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error generating invoice: %', SQLERRM USING ERRCODE = 'P0001';
    END;
END;
$$;

-- Enhanced document management with better error handling
CREATE OR REPLACE FUNCTION sp_get_client_documents_v1(
    p_client_id UUID,
    p_tenant_id UUID
) RETURNS TABLE(
    document_id UUID,
    name TEXT,
    file_path TEXT,
    mime_type TEXT,
    file_size BIGINT,
    document_type TEXT,
    report_category TEXT,
    report_subcategory TEXT,
    is_private BOOLEAN,
    is_shared_with_client BOOLEAN,
    uploaded_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_client_exists BOOLEAN := FALSE;
BEGIN
    -- Input validation
    IF p_client_id IS NULL OR p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Client ID and Tenant ID cannot be null' USING ERRCODE = '22004';
    END IF;

    -- Validate tenant access
    IF p_tenant_id <> (auth.jwt() ->> 'tenant_id')::uuid THEN
        RAISE EXCEPTION 'Access denied: tenant mismatch' USING ERRCODE = '42501';
    END IF;

    BEGIN
        -- Verify client exists
        SELECT EXISTS(
            SELECT 1 FROM tbl_clients 
            WHERE id = p_client_id AND tenant_id = p_tenant_id
        ) INTO v_client_exists;

        IF NOT v_client_exists THEN
            RAISE EXCEPTION 'Client not found or access denied' USING ERRCODE = '02000';
        END IF;

        -- Return documents with optimized query
        RETURN QUERY
        SELECT 
            d.id,
            d.name,
            d.file_path,
            d.mime_type,
            d.file_size,
            d.document_type,
            d.report_category,
            d.report_subcategory,
            d.is_private,
            d.is_shared_with_client,
            COALESCE(t.full_name, 'Unknown') as uploaded_by_name,
            d.created_at
        FROM tbl_documents d
        LEFT JOIN tbl_therapists t ON t.id = d.uploaded_by
        WHERE d.tenant_id = p_tenant_id AND d.client_id = p_client_id
        ORDER BY d.created_at DESC;

    EXCEPTION
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error retrieving documents: %', SQLERRM USING ERRCODE = 'P0001';
    END;
END;
$$;

-- Create audit log function for pgAudit integration
CREATE OR REPLACE FUNCTION sp_audit_function_call_v1(
    p_function_name TEXT,
    p_parameters JSONB,
    p_tenant_id UUID,
    p_user_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    INSERT INTO tbl_audit_logs (
        entity, entity_id, action, actor_id, tenant_id, details
    ) VALUES (
        'stored_procedures', p_function_name, 'FUNCTION_CALL', p_user_id, p_tenant_id,
        jsonb_build_object(
            'function_name', p_function_name,
            'parameters', p_parameters,
            'execution_time', NOW(),
            'session_info', jsonb_build_object(
                'application_name', current_setting('application_name', true),
                'client_addr', inet_client_addr(),
                'client_port', inet_client_port()
            )
        )
    );
END;
$$;
