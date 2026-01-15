// @ts-check

import eslint from '@eslint/js'
import { globalIgnores } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    [globalIgnores(['eslint.config.mjs', 'lib/jutge_api_client.ts', 'assets/**', 'dist/**'])],

    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            // '@typescript-eslint/no-unsafe-return': 'off',
            // '@typescript-eslint/no-unsafe-argument': 'off',
        },
    },
)
