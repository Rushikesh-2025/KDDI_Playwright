import { test, expect, Page } from '@playwright/test';
import LoginPage from "../pages/LoginPage";
import logger from "../utils/LoggerUtil";
import { EnvConfig } from "../config/viriableConstant";
import { authenticator } from 'otplib'; // ✅ Import otplib's authenticator
