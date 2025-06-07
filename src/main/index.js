import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import connectDB from './db';

async function foo(event, data) {
  try {
    console.log(data)
    dialog.showMessageBox({ message: 'message back' })
  } catch (e) {
    dialog.showErrorBox('Ошибка', e)
  }
}

async function getPartnersHandler() {
  try {
    const client = global.dbclient;
    const result = await client.query(`
      WITH partner_sales AS (
        SELECT 
          p.partner_id,
          p.partner_type,
          p.partner_name,
          p.partner_legal_address,
          p.partner_phone,
          p.partner_rating,
          ROUND(SUM(s.sale_quantity * pr.product_min_price * pt.product_type_coefficient)::numeric, 2) as total_cost
        FROM partners p
        LEFT JOIN sales s ON p.partner_id = s.sale_partner_name_id
        LEFT JOIN products pr ON s.sale_product_name_id = pr.product_id
        LEFT JOIN product_types pt ON pr.product_type_name_id = pt.product_type_id
        GROUP BY p.partner_id, p.partner_type, p.partner_name, p.partner_legal_address, p.partner_phone, p.partner_rating
      )
      SELECT 
        partner_id,
        partner_type,
        partner_name,
        partner_legal_address,
        partner_phone,
        partner_rating,
        COALESCE(total_cost, 0) as total_cost
      FROM partner_sales
      ORDER BY partner_rating DESC, total_cost DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching partners:', error);
    throw error;
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  global.dbclient = await connectDB();

  ipcMain.handle('sendSignal', foo)
  ipcMain.handle('getPartners', getPartnersHandler)

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
