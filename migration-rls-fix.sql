-- Activer RLS sur la table samples
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes sur samples
DROP POLICY IF EXISTS select_all_samples ON public.samples;
DROP POLICY IF EXISTS insert_samples ON public.samples;
DROP POLICY IF EXISTS update_samples ON public.samples;
DROP POLICY IF EXISTS delete_samples ON public.samples;

-- Créer des politiques permissives pour permettre les opérations anonymes
-- Politique pour permettre à tous de LIRE
CREATE POLICY select_all_samples ON public.samples
    FOR SELECT USING (true);

-- Politique pour permettre à tous d'INSÉRER
CREATE POLICY insert_samples ON public.samples
    FOR INSERT WITH CHECK (true);

-- Politique pour permettre à tous de METTRE À JOUR
CREATE POLICY update_samples ON public.samples
    FOR UPDATE USING (true) WITH CHECK (true);

-- Politique pour permettre à tous de SUPPRIMER
CREATE POLICY delete_samples ON public.samples
    FOR DELETE USING (true);

-- Commentaire: Ces politiques permettent à tous les utilisateurs, y compris anonymes,
-- d'effectuer toutes les opérations CRUD sur la table samples.
-- Dans un environnement de production, vous devriez restreindre ces politiques
-- en fonction de vos besoins de sécurité. 