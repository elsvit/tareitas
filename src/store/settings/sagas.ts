import { initLanguage, setLanguage } from './slice';
import { select } from 'redux-saga/effects';
import { takeLatestWithFetchable } from '../helpers/fetchableHandler';
import { call } from 'redux-saga/effects';
import { put } from 'redux-saga/effects';
import { LocalizationService } from '~/services/localization/localization';
import { syncTaskBaseTranslations } from '~/store/taskBase/slice';
import { selectLang } from './selectors';

function* initLanguageSaga(): Generator<any, void, any> {
  const storeLang = yield select(selectLang);
  const lang = yield call(LocalizationService.init, storeLang);
  yield put(setLanguage(lang));
  yield put(syncTaskBaseTranslations());
}

export default [takeLatestWithFetchable(initLanguage, initLanguageSaga)];
