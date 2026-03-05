import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { menusApi } from '@/api/menus';
import { categoriesApi } from '@/api/categories';
import { uploadApi } from '@/api/upload';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { formatPrice } from '@/utils/format';
import type { Menu, Category, CreateMenuRequest } from '@/types';

// 이미지 URL은 Vite proxy를 통해 /uploads/ 경로 사용

export function MenuManagementPage() {
  const { storeId } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 카테고리 관리
  const [newCategoryName, setNewCategoryName] = useState('');

  // 메뉴 폼
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menuForm, setMenuForm] = useState<CreateMenuRequest & { imageFile?: File }>({
    name: '', price: 0, categoryId: 0, description: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // 삭제 확인
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string; onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const fetchData = useCallback(async () => {
    if (!storeId) return;
    try {
      const [catRes, menuRes] = await Promise.all([
        categoriesApi.getAll(storeId),
        menusApi.getAll(storeId),
      ]);
      setCategories(catRes.data);
      setMenus(menuRes.data);
      if (catRes.data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(catRes.data[0].id);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [storeId, selectedCategoryId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredMenus = menus
    .filter((m) => !selectedCategoryId || m.categoryId === selectedCategoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // 카테고리 추가
  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!storeId || !newCategoryName.trim()) return;
    try {
      const res = await categoriesApi.create(storeId, { name: newCategoryName.trim() });
      setCategories((prev) => [...prev, res.data]);
      setNewCategoryName('');
    } catch { /* ignore */ }
  };

  // 카테고리 삭제
  const handleDeleteCategory = (catId: number, catName: string) => {
    setConfirmModal({
      isOpen: true,
      title: '카테고리 삭제',
      message: `"${catName}" 카테고리를 삭제하시겠습니까?`,
      onConfirm: async () => {
        if (!storeId) return;
        try {
          await categoriesApi.delete(storeId, catId);
          setCategories((prev) => prev.filter((c) => c.id !== catId));
          setMenus((prev) => prev.filter((m) => m.categoryId !== catId));
          if (selectedCategoryId === catId) setSelectedCategoryId(null);
        } catch { /* ignore */ }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 메뉴 폼 열기 (등록/수정)
  const openMenuForm = (menu?: Menu) => {
    if (menu) {
      setEditingMenu(menu);
      setMenuForm({
        name: menu.name, price: menu.price, categoryId: menu.categoryId,
        description: menu.description || '',
      });
      setImagePreview(menu.imageUrl ? menu.imageUrl : null);
    } else {
      setEditingMenu(null);
      setMenuForm({ name: '', price: 0, categoryId: selectedCategoryId || 0, description: '' });
      setImagePreview(null);
    }
    setFormError('');
    setShowMenuForm(true);
  };

  // 이미지 선택
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFormError('JPEG, PNG, GIF, WebP 형식만 허용됩니다.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    setMenuForm((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(URL.createObjectURL(file));
    setFormError('');
  };

  // 메뉴 저장 (US-701, US-702)
  const handleSaveMenu = async (e: FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    if (!menuForm.name.trim()) { setFormError('메뉴명을 입력해주세요.'); return; }
    if (menuForm.price < 0) { setFormError('가격은 0 이상이어야 합니다.'); return; }
    if (!menuForm.categoryId) { setFormError('카테고리를 선택해주세요.'); return; }

    setFormLoading(true);
    setFormError('');

    try {
      let imageUrl = editingMenu?.imageUrl;

      // 이미지 업로드
      if (menuForm.imageFile) {
        const uploadRes = await uploadApi.uploadImage(menuForm.imageFile);
        imageUrl = uploadRes.data.url;
      }

      const data = {
        name: menuForm.name.trim(),
        price: menuForm.price,
        categoryId: menuForm.categoryId,
        description: menuForm.description || undefined,
        imageUrl: imageUrl || undefined,
      };

      if (editingMenu) {
        const res = await menusApi.update(storeId, editingMenu.id, data);
        setMenus((prev) => prev.map((m) => (m.id === editingMenu.id ? res.data : m)));
      } else {
        const res = await menusApi.create(storeId, data);
        setMenus((prev) => [...prev, res.data]);
      }
      setShowMenuForm(false);
    } catch {
      setFormError('메뉴 저장에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 메뉴 삭제 (US-703)
  const handleDeleteMenu = (menuId: number, menuName: string) => {
    setConfirmModal({
      isOpen: true,
      title: '메뉴 삭제',
      message: `"${menuName}" 메뉴를 삭제하시겠습니까?`,
      onConfirm: async () => {
        if (!storeId) return;
        try {
          await menusApi.delete(storeId, menuId);
          setMenus((prev) => prev.filter((m) => m.id !== menuId));
        } catch { /* ignore */ }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // 메뉴 순서 변경 (US-704)
  const handleMoveMenu = async (menuId: number, direction: 'up' | 'down') => {
    if (!storeId) return;
    const idx = filteredMenus.findIndex((m) => m.id === menuId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= filteredMenus.length) return;

    const reordered = [...filteredMenus];
    [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

    const reorderData = reordered.map((m, i) => ({ menuId: m.id, sortOrder: i }));
    try {
      await menusApi.reorder(storeId, { items: reorderData });
      // 로컬 상태 업데이트
      const updatedMenus = menus.map((m) => {
        const found = reorderData.find((r) => r.menuId === m.id);
        return found ? { ...m, sortOrder: found.sortOrder } : m;
      });
      setMenus(updatedMenus);
    } catch { /* ignore */ }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>로딩 중...</div>;
  }

  return (
    <div data-testid="menu-management-page" style={{ display: 'flex', gap: '24px' }}>
      {/* 카테고리 사이드바 */}
      <div style={{ width: '220px', flexShrink: 0 }}>
        <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>카테고리</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '16px' }}>
          <button
            data-testid="category-all-button"
            onClick={() => setSelectedCategoryId(null)}
            style={{
              padding: '10px 12px', borderRadius: '8px', border: 'none', textAlign: 'left',
              background: !selectedCategoryId ? '#e3f2fd' : 'transparent',
              fontWeight: !selectedCategoryId ? 600 : 400, cursor: 'pointer',
            }}
          >
            전체
          </button>
          {categories.map((cat) => (
            <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                data-testid={`category-button-${cat.id}`}
                onClick={() => setSelectedCategoryId(cat.id)}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: '8px', border: 'none', textAlign: 'left',
                  background: selectedCategoryId === cat.id ? '#e3f2fd' : 'transparent',
                  fontWeight: selectedCategoryId === cat.id ? 600 : 400, cursor: 'pointer',
                }}
              >
                {cat.name}
              </button>
              <button
                data-testid={`category-delete-button-${cat.id}`}
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53935', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '4px' }}>
          <input
            data-testid="category-name-input"
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="새 카테고리"
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
          />
          <button
            data-testid="category-add-button"
            type="submit"
            style={{
              padding: '8px 12px', borderRadius: '6px', border: 'none',
              background: '#1a1a2e', color: '#fff', cursor: 'pointer', fontSize: '13px',
            }}
          >
            추가
          </button>
        </form>
      </div>

      {/* 메뉴 목록 (US-704) */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px' }}>메뉴 목록</h2>
          <button
            data-testid="menu-add-button"
            onClick={() => openMenuForm()}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              background: '#1a1a2e', color: '#fff', cursor: 'pointer', fontSize: '14px',
            }}
          >
            + 메뉴 등록
          </button>
        </div>

        {filteredMenus.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>등록된 메뉴가 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredMenus.map((menu, idx) => (
              <div
                key={menu.id}
                data-testid={`menu-item-${menu.id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: '#fff', borderRadius: '10px', padding: '12px 16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* 순서 변경 버튼 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    data-testid={`menu-move-up-${menu.id}`}
                    onClick={() => handleMoveMenu(menu.id, 'up')}
                    disabled={idx === 0}
                    style={{
                      background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer',
                      color: idx === 0 ? '#ddd' : '#666', fontSize: '14px',
                    }}
                  >
                    ▲
                  </button>
                  <button
                    data-testid={`menu-move-down-${menu.id}`}
                    onClick={() => handleMoveMenu(menu.id, 'down')}
                    disabled={idx === filteredMenus.length - 1}
                    style={{
                      background: 'none', border: 'none',
                      cursor: idx === filteredMenus.length - 1 ? 'default' : 'pointer',
                      color: idx === filteredMenus.length - 1 ? '#ddd' : '#666', fontSize: '14px',
                    }}
                  >
                    ▼
                  </button>
                </div>

                {/* 이미지 */}
                {menu.imageUrl ? (
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: '24px' }}>
                    🍽️
                  </div>
                )}

                {/* 정보 */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: '4px' }}>{menu.name}</div>
                  <div style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: 700 }}>{formatPrice(menu.price)}</div>
                  {menu.description && (
                    <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{menu.description}</div>
                  )}
                </div>

                {/* 액션 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    data-testid={`menu-edit-button-${menu.id}`}
                    onClick={() => openMenuForm(menu)}
                    style={{
                      padding: '6px 14px', borderRadius: '6px', border: '1px solid #ddd',
                      background: '#fff', cursor: 'pointer', fontSize: '13px',
                    }}
                  >
                    수정
                  </button>
                  <button
                    data-testid={`menu-delete-button-${menu.id}`}
                    onClick={() => handleDeleteMenu(menu.id, menu.name)}
                    style={{
                      padding: '6px 14px', borderRadius: '6px', border: '1px solid #e53935',
                      background: '#fff', color: '#e53935', cursor: 'pointer', fontSize: '13px',
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 메뉴 등록/수정 모달 (US-701, US-702) */}
      {showMenuForm && (
        <div
          data-testid="menu-form-modal-overlay"
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowMenuForm(false)}
        >
          <div
            data-testid="menu-form-modal"
            style={{
              background: '#fff', borderRadius: '16px', padding: '24px',
              width: '480px', maxHeight: '80vh', overflow: 'auto',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>
              {editingMenu ? '메뉴 수정' : '메뉴 등록'}
            </h3>

            {formError && (
              <div style={{ padding: '10px', borderRadius: '8px', background: '#ffebee', color: '#c62828', marginBottom: '16px', fontSize: '14px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveMenu}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="menuName" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  메뉴명 *
                </label>
                <input
                  id="menuName"
                  data-testid="menu-form-name-input"
                  type="text"
                  value={menuForm.name}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="menuPrice" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  가격 (원) *
                </label>
                <input
                  id="menuPrice"
                  data-testid="menu-form-price-input"
                  type="number"
                  min="0"
                  value={menuForm.price}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="menuCategory" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  카테고리 *
                </label>
                <select
                  id="menuCategory"
                  data-testid="menu-form-category-select"
                  value={menuForm.categoryId}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, categoryId: Number(e.target.value) }))}
                  required
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd' }}
                >
                  <option value={0}>카테고리 선택</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="menuDescription" style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  설명
                </label>
                <textarea
                  id="menuDescription"
                  data-testid="menu-form-description-input"
                  value={menuForm.description}
                  onChange={(e) => setMenuForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #ddd', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                  이미지
                </label>
                <input
                  data-testid="menu-form-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  style={{ fontSize: '14px' }}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    style={{ marginTop: '8px', width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowMenuForm(false)}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  data-testid="menu-form-submit-button"
                  type="submit"
                  disabled={formLoading}
                  style={{
                    padding: '8px 20px', borderRadius: '8px', border: 'none',
                    background: '#1a1a2e', color: '#fff', cursor: 'pointer',
                  }}
                >
                  {formLoading ? '저장 중...' : (editingMenu ? '수정' : '등록')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
